/**
 * Stub for optional atlas mode (pre-generated image grid approach)
 * This would replace the depth-based approach with image swapping
 */

export interface AtlasConfig {
  basePath: string
  min: number
  max: number
  step: number
  size: number
}

export interface AtlasState {
  currentImage: string | null
  isLoading: boolean
  error: string | null
}

/**
 * Hook for atlas-based gaze tracking (not implemented in MVP)
 * This would:
 * 1. Load a grid of pre-generated gaze images
 * 2. Map cursor position to nearest grid coordinate (px, py)
 * 3. Update image src based on grid position
 */
export function useAtlasMode(
  config: AtlasConfig,
  cursorX: number,
  cursorY: number,
  containerWidth: number,
  containerHeight: number
): AtlasState {
  // Stub implementation - returns placeholder state
  return {
    currentImage: null,
    isLoading: false,
    error: 'Atlas mode not implemented in MVP'
  }
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
  // Normalize cursor (0 to 1)
  const normalizedX = cursorX / containerWidth
  const normalizedY = cursorY / containerHeight

  // Map to grid coordinates
  const px = Math.round((normalizedX * (max - min) + min) / step) * step
  const py = Math.round((normalizedY * (max - min) + min) / step) * step

  // Clamp to bounds
  const clampedPx = Math.max(min, Math.min(max, px))
  const clampedPy = Math.max(min, Math.min(max, py))

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

