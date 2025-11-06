import { useState, useEffect, useCallback } from 'react'

/**
 * Configuration for atlas mode
 */
export interface AtlasConfig {
  min: number
  max: number
  step: number
  fallbackImage?: string
}

/**
 * State returned by useAtlasMode hook
 */
export interface AtlasState {
  currentImageUrl: string | null
  gridCoords: { px: number; py: number } | null
  isLoading: boolean
  error: string | null
}

/**
 * Hook for atlas-based gaze tracking
 * Maps cursor position to grid coordinates and returns the corresponding image URL
 *
 * @param imageMap Map of grid coordinates to image URLs (e.g., "px-15_py-15" -> imageUrl)
 * @param cursorX Current cursor X position (relative to container)
 * @param cursorY Current cursor Y position (relative to container)
 * @param containerWidth Width of the container
 * @param containerHeight Height of the container
 * @param config Atlas configuration (min, max, step, fallbackImage)
 * @returns Current image URL, grid coordinates, loading state, and error
 */
export function useAtlasMode(
  imageMap: Map<string, string> | null,
  cursorX: number,
  cursorY: number,
  containerWidth: number,
  containerHeight: number,
  config: AtlasConfig
): AtlasState {
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null)
  const [gridCoords, setGridCoords] = useState<{ px: number; py: number } | null>(null)

  // Update image based on cursor position
  const updateImage = useCallback(() => {
    if (!imageMap || imageMap.size === 0) {
      setCurrentImageUrl(null)
      setGridCoords(null)
      return
    }

    // Log available keys in map for debugging
    if (imageMap.size > 0) {
      const keys = Array.from(imageMap.keys())
      console.log('[ATLAS-HOOK] Available keys in map:', keys.slice(0, 10), `... (${keys.length} total)`)
    }

    // Validate container dimensions to avoid NaN
    if (containerWidth <= 0 || containerHeight <= 0) {
      // Container not ready, use center coordinates as default
      const coords = { px: config.min, py: config.min }
      setGridCoords(coords)
      const key = createAtlasKey(coords.px, coords.py)
      let imageUrl = imageMap.get(key)
      if (!imageUrl && config.fallbackImage) {
        imageUrl = imageMap.get(config.fallbackImage)
      }
      if (!imageUrl) {
        imageUrl = imageMap.get('px0_py0')
      }
      if (imageUrl) {
        setCurrentImageUrl(imageUrl)
      }
      return
    }

    // Calculate grid coordinates from cursor position
    const coords = cursorToGridCoords(
      cursorX,
      cursorY,
      containerWidth,
      containerHeight,
      config.min,
      config.max,
      config.step
    )

    console.log('[ATLAS-HOOK] Calculated coords:', {
      cursorX,
      cursorY,
      containerWidth,
      containerHeight,
      config: { min: config.min, max: config.max, step: config.step },
      calculatedCoords: coords
    })

    setGridCoords(coords)

    // Create key for image lookup
    const key = createAtlasKey(coords.px, coords.py)
    console.log('[ATLAS-HOOK] Looking up key:', key, 'in map size:', imageMap.size)

    // Get image URL from map
    let imageUrl = imageMap.get(key)
    console.log('[ATLAS-HOOK] Found URL for key:', !!imageUrl)

    // Fallback to center image if not found
    if (!imageUrl && config.fallbackImage) {
      imageUrl = imageMap.get(config.fallbackImage)
    }

    // Fallback to center if fallback not specified
    if (!imageUrl) {
      imageUrl = imageMap.get('px0_py0')
    }

    // Always update the image URL, even if it's the same
    // This ensures React detects the change and triggers dependent effects
    if (imageUrl) {
      setCurrentImageUrl(imageUrl)
    } else {
      // Clear if no image found
      setCurrentImageUrl(null)
    }
  }, [imageMap, cursorX, cursorY, containerWidth, containerHeight, config])

  useEffect(() => {
    updateImage()
  }, [updateImage])

  return {
    currentImageUrl,
    gridCoords,
    isLoading: false,
    error: imageMap === null ? 'No atlas generated' : null
  }
}

/**
 * Create a key for atlas image lookup
 * Converts negative numbers to use 'm' prefix (e.g., -15 becomes m15)
 * Format: px{x}_py{y} (e.g., "px-15_py0" or "px15_pym15")
 */
export function createAtlasKey(px: number, py: number): string {
  return `px${px}_py${py}`
}

/**
 * Calculate grid coordinates from cursor position
 */
export function cursorToGridCoords(
  cursorX: number,
  cursorY: number,
  containerWidth: number,
  containerHeight: number,
  min: number,
  max: number,
  step: number
): { px: number; py: number } {
  // Guard against invalid dimensions
  if (containerWidth <= 0 || containerHeight <= 0) {
    return { px: 0, py: 0 }
  }

  // Normalize cursor (0 to 1)
  const normalizedX = containerWidth > 0 ? cursorX / containerWidth : 0
  // Invert Y since screen Y increases downward but we want positive py to look up
  const normalizedY = containerHeight > 0 ? 1 - (cursorY / containerHeight) : 0

  // Map to grid coordinates
  const px = Math.round((normalizedX * (max - min) + min) / step) * step
  const py = Math.round((normalizedY * (max - min) + min) / step) * step

  // Guard against NaN and clamp to bounds
  const clampedPx = !isNaN(px) ? Math.max(min, Math.min(max, px)) : 0
  const clampedPy = !isNaN(py) ? Math.max(min, Math.min(max, py)) : 0

  return { px: clampedPx, py: clampedPy }
}

/**
 * Generate image filename from grid coordinates
 */
export function gridCoordsToFilename(
  px: number,
  py: number,
  basePath: string,
  size: number
): string {
  // Handle negative values with 'm' prefix (like face_looker)
  const pxStr = px < 0 ? `m${Math.abs(px)}` : `${px}`
  const pyStr = py < 0 ? `m${Math.abs(py)}` : `${py}`
  return `${basePath}gaze_px${pxStr}_py${pyStr}_${size}.webp`
}

