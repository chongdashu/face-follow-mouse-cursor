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
 * @returns Object with cache status information
 */
export async function checkAtlasCache(
  image: HTMLImageElement | string,
  min: number = -15,
  max: number = 15,
  step: number = 3
): Promise<{
  total: number
  cached: number
  imageHash: string
}> {
  // Compute image hash
  let imageHash: string
  if (image instanceof HTMLImageElement) {
    imageHash = await hashImage(image)
  } else {
    throw new Error('Cache check requires HTMLImageElement')
  }

  // Call cache check endpoint
  const response = await fetch('/api/check-atlas-cache', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ imageHash, min, max, step }),
  })

  if (!response.ok) {
    console.warn('Cache check failed, proceeding with generation')
    return { total: 0, cached: 0, imageHash }
  }

  const data = await response.json()
  return {
    total: data.total,
    cached: data.cached,
    imageHash,
  }
}

/**
 * Generate a batch of gaze images for the atlas grid
 * Automatically checks cache and only generates missing images
 *
 * @param image - Source image
 * @param min - Minimum angle (default: -15)
 * @param max - Maximum angle (default: 15)
 * @param step - Step size (default: 3)
 * @param onProgress - Optional progress callback (completed, total, cached)
 * @returns Promise resolving to map of (px, py) -> imageUrl
 */
export async function generateGazeAtlas(
  image: HTMLImageElement | string,
  min: number = -15,
  max: number = 15,
  step: number = 3,
  onProgress?: (completed: number, total: number, cached: number) => void
): Promise<Map<string, string>> {
  const results = new Map<string, string>()
  const angles: Array<{ px: number; py: number }> = []

  // Compute image hash once
  let imageHash: string | undefined
  if (image instanceof HTMLImageElement) {
    imageHash = await hashImage(image)
    console.log(`[ATLAS] Image hash: ${imageHash.substring(0, 8)}...`)
  }

  // Check cache status first
  let cacheStatus: { total: number; cached: number; imageHash: string } | null = null
  if (imageHash) {
    try {
      const response = await fetch('/api/check-atlas-cache', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageHash, min, max, step }),
      })

      if (response.ok) {
        cacheStatus = await response.json()
        if (cacheStatus) {
          console.log(`[ATLAS] Cache status: ${cacheStatus.cached}/${cacheStatus.total} cached`)
        }
      }
    } catch (error) {
      console.warn('[ATLAS] Cache check failed:', error)
    }
  }

  // Generate all angle combinations
  for (let px = min; px <= max; px += step) {
    for (let py = min; py <= max; py += step) {
      angles.push({ px, py })
    }
  }

  const total = angles.length
  let completed = 0
  let cachedCount = 0

  // Generate images sequentially to avoid rate limits
  // The API will automatically check cache for each request
  for (const { px, py } of angles) {
    try {
      const result = await generateGazeImage({ image, px, py, imageHash })
      const key = `px${px}_py${py}`
      results.set(key, result.imageUrl)

      if (result.cached) {
        cachedCount++
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

