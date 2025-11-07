/**
 * Client-side service for generating gaze images via Replicate API
 * Uses Vercel serverless function to keep API key secure
 * Includes caching to avoid regenerating previously processed images
 */

import { hashImage } from '../hash/imageHash'

export interface GazeGenerationOptions {
  image: HTMLImageElement | string // Image element or base64 string
  px: number // Horizontal gaze angle (-15 to 15)
  py: number // Vertical gaze angle (-15 to 15)
  imageHash?: string // Optional pre-computed hash for cache lookup
}

export interface GazeGenerationResult {
  success: boolean
  imageUrl: string
  px: number
  py: number
  cached?: boolean // Indicates if result came from cache
}

export interface GazeGenerationError {
  error: string
  predictionId?: string
}

/**
 * Convert image to base64 string
 */
function imageToBase64(image: HTMLImageElement): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    canvas.width = image.width
    canvas.height = image.height
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      reject(new Error('Could not get canvas context'))
      return
    }
    ctx.drawImage(image, 0, 0)
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to convert image to blob'))
        return
      }
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1]
        resolve(base64)
      }
      reader.onerror = () => reject(new Error('Failed to read blob'))
      reader.readAsDataURL(blob)
    }, 'image/jpeg', 0.9)
  })
}

/**
 * Generate a single gaze image using Replicate API via serverless function
 * Automatically checks cache before generating
 *
 * @param options - Generation options
 * @returns Promise resolving to the generated image URL
 */
export async function generateGazeImage(
  options: GazeGenerationOptions
): Promise<GazeGenerationResult> {
  let imageBase64: string

  // Convert image to base64 if needed
  if (options.image instanceof HTMLImageElement) {
    imageBase64 = await imageToBase64(options.image)
  } else if (typeof options.image === 'string') {
    // Assume it's already base64 (remove data URL prefix if present)
    imageBase64 = options.image.includes(',')
      ? options.image.split(',')[1]
      : options.image
  } else {
    throw new Error('Invalid image format. Expected HTMLImageElement or base64 string.')
  }

  // Call our serverless function (it will check cache automatically)
  const response = await fetch('/api/generate-gaze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image: imageBase64,
      px: options.px,
      py: options.py,
      imageHash: options.imageHash, // Pass hash for cache lookup
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to generate gaze image')
  }

  return data as GazeGenerationResult
}

/**
 * Check cache status for an atlas configuration
 * Uses provided imageHash for deterministic caching across browsers
 * @param image - Source image (required for backward compatibility)
 * @param min - Minimum gaze angle
 * @param max - Maximum gaze angle
 * @param step - Step size for angles
 * @param imageHash - Optional precomputed hash (preferred for stable cache keys)
 * @returns Object with cache status information
 */
export async function checkAtlasCache(
  image: HTMLImageElement | string,
  min: number = -15,
  max: number = 15,
  step: number = 3,
  imageHash?: string
): Promise<{
  total: number
  cached: number
  imageHash: string
}> {
  // Use provided hash or compute it
  let hash: string
  if (imageHash) {
    hash = imageHash
  } else if (image instanceof HTMLImageElement) {
    hash = await hashImage(image)
  } else {
    throw new Error('Cache check requires HTMLImageElement or imageHash parameter')
  }

  // Call cache check endpoint
  const response = await fetch('/api/check-atlas-cache', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ imageHash: hash, min, max, step }),
  })

  if (!response.ok) {
    console.warn('Cache check failed, proceeding with generation')
    return { total: 0, cached: 0, imageHash: hash }
  }

  const data = await response.json()
  return {
    total: data.total,
    cached: data.cached,
    imageHash: hash,
  }
}

/**
 * Generate a batch of gaze images for the atlas grid
 * Automatically checks cache and only generates missing images
 * Uses provided imageHash for deterministic caching across browsers
 *
 * @param image - Source image
 * @param min - Minimum angle (default: -15)
 * @param max - Maximum angle (default: 15)
 * @param step - Step size (default: 3)
 * @param onProgress - Optional progress callback (completed, total, cached)
 * @param imageHash - Optional precomputed hash (preferred for stable cache keys)
 * @returns Promise resolving to map of (px, py) -> imageUrl
 */
export async function generateGazeAtlas(
  image: HTMLImageElement | string,
  min: number = -15,
  max: number = 15,
  step: number = 3,
  onProgress?: (completed: number, total: number, cached: number) => void,
  imageHash?: string
): Promise<Map<string, string>> {
  const results = new Map<string, string>()

  // Compute image hash once (or use provided)
  let hash: string | undefined
  if (imageHash) {
    hash = imageHash
    console.log(`[ATLAS] Using provided image hash: ${hash.substring(0, 8)}...`)
  } else if (image instanceof HTMLImageElement) {
    hash = await hashImage(image)
    console.log(`[ATLAS] Image hash: ${hash.substring(0, 8)}...`)
  }

  // Check cache status first and use cached images directly
  const cachedImages = new Map<string, string>() // Map of "px${px}_py${py}" -> url
  const missingAngles: Array<{ px: number; py: number }> = []
  
  if (hash) {
    try {
      const response = await fetch('/api/check-atlas-cache', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageHash: hash, min, max, step }),
      })

      if (response.ok) {
        const cacheStatus = await response.json()
        console.log(`[ATLAS] Cache check response:`, cacheStatus)
        
        if (cacheStatus) {
          console.log(`[ATLAS] Cache status: ${cacheStatus.cached}/${cacheStatus.total} cached`)
          
          // Add cached images directly to results
          if (cacheStatus.found && Array.isArray(cacheStatus.found)) {
            console.log(`[ATLAS] Found ${cacheStatus.found.length} cached images, adding to results`)
            for (const item of cacheStatus.found) {
              const key = `px${item.px}_py${item.py}`
              cachedImages.set(key, item.url)
              results.set(key, item.url)
              console.log(`[ATLAS] Added cached image: ${key} -> ${item.url.substring(0, 50)}...`)
            }
          } else {
            console.warn(`[ATLAS] No 'found' array in cache status or it's not an array:`, cacheStatus.found)
          }
          
          // Collect missing angles that need generation
          if (cacheStatus.missing && Array.isArray(cacheStatus.missing)) {
            console.log(`[ATLAS] Found ${cacheStatus.missing.length} missing images to generate`)
            for (const item of cacheStatus.missing) {
              missingAngles.push({ px: item.px, py: item.py })
            }
          } else {
            console.warn(`[ATLAS] No 'missing' array in cache status or it's not an array:`, cacheStatus.missing)
          }
        }
      } else {
        const errorText = await response.text()
        console.warn(`[ATLAS] Cache check failed with status ${response.status}:`, errorText)
      }
    } catch (error) {
      console.warn('[ATLAS] Cache check failed:', error)
    }
  } else {
    console.warn('[ATLAS] No hash provided, cannot check cache')
  }

  console.log(`[ATLAS] After cache check: ${cachedImages.size} cached, ${missingAngles.length} missing`)

  // If cache check didn't work or returned no data, generate all angles
  if (missingAngles.length === 0 && cachedImages.size === 0) {
    console.warn('[ATLAS] No cache data found, generating all angles')
    for (let px = min; px <= max; px += step) {
      for (let py = min; py <= max; py += step) {
        missingAngles.push({ px, py })
      }
    }
  }

  const total = (cachedImages.size + missingAngles.length) || 1
  let completed = cachedImages.size
  let cachedCount = cachedImages.size

  // Report initial progress for cached images
  if (cachedCount > 0) {
    onProgress?.(completed, total, cachedCount)
  }

  // Generate only missing images sequentially to avoid rate limits
  console.log(`[ATLAS] Starting generation for ${missingAngles.length} missing images`)
  for (const { px, py } of missingAngles) {
    const key = `px${px}_py${py}`
    // Double-check: if this image is already in results (from cache), skip it
    if (results.has(key)) {
      console.log(`[ATLAS] Skipping ${key} - already in results from cache`)
      continue
    }
    
    console.log(`[ATLAS] Generating ${key}...`)
    try {
      const result = await generateGazeImage({ image, px, py, imageHash: hash })
      results.set(key, result.imageUrl)

      if (result.cached) {
        cachedCount++
        console.log(`[ATLAS] ${key} was cached (API returned cached=true)`)
      } else {
        console.log(`[ATLAS] ${key} generated new (API returned cached=false)`)
      }

      completed++
      onProgress?.(completed, total, cachedCount)
    } catch (error) {
      console.error(`Failed to generate gaze for px=${px}, py=${py}:`, error)
      // Continue with other images even if one fails
      completed++
      onProgress?.(completed, total, cachedCount)
    }
  }

  console.log(`[ATLAS] Complete: ${completed}/${total} (${cachedCount} from cache)`)

  return results
}

