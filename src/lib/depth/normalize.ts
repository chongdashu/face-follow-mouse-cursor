/**
 * Normalize depth map to [0, 1] range with optional smoothing
 */

/**
 * Normalize depth values to [0, 1] range
 */
export function normalizeDepth(depthData: Float32Array): Float32Array {
  const length = depthData.length
  if (length === 0) return depthData

  // Find min and max
  let min = Infinity
  let max = -Infinity
  for (let i = 0; i < length; i++) {
    const value = depthData[i]
    if (value < min) min = value
    if (value > max) max = value
  }

  // Normalize to [0, 1]
  const range = max - min
  if (range === 0) {
    // All values are the same, set to 0.5
    return new Float32Array(length).fill(0.5)
  }

  const normalized = new Float32Array(length)
  for (let i = 0; i < length; i++) {
    normalized[i] = (depthData[i] - min) / range
  }

  return normalized
}

/**
 * Simple edge-preserving smoothing (bilateral-like)
 * This is a simplified version - for production, consider a proper bilateral filter
 */
export function smoothDepth(
  depthData: Float32Array,
  width: number,
  height: number,
  sigmaSpatial = 2.0,
  sigmaColor = 0.1
): Float32Array {
  const smoothed = new Float32Array(depthData)
  const kernelSize = Math.ceil(sigmaSpatial * 3) * 2 + 1
  const halfKernel = Math.floor(kernelSize / 2)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x
      const centerValue = depthData[idx]

      let weightSum = 0
      let valueSum = 0

      for (let ky = -halfKernel; ky <= halfKernel; ky++) {
        for (let kx = -halfKernel; kx <= halfKernel; kx++) {
          const nx = x + kx
          const ny = y + ky

          if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue

          const nIdx = ny * width + nx
          const neighborValue = depthData[nIdx]

          // Spatial weight (Gaussian)
          const spatialDist = Math.sqrt(kx * kx + ky * ky)
          const spatialWeight = Math.exp(-(spatialDist * spatialDist) / (2 * sigmaSpatial * sigmaSpatial))

          // Color weight (intensity difference)
          const colorDiff = Math.abs(neighborValue - centerValue)
          const colorWeight = Math.exp(-(colorDiff * colorDiff) / (2 * sigmaColor * sigmaColor))

          const weight = spatialWeight * colorWeight
          weightSum += weight
          valueSum += neighborValue * weight
        }
      }

      smoothed[idx] = weightSum > 0 ? valueSum / weightSum : centerValue
    }
  }

  return smoothed
}

/**
 * Convert normalized depth array to ImageData
 */
export function depthToImageData(
  depthData: Float32Array,
  width: number,
  height: number
): ImageData {
  const imageData = new ImageData(width, height)
  const data = imageData.data

  for (let i = 0; i < depthData.length; i++) {
    const value = Math.floor(depthData[i] * 255)
    const idx = i * 4
    data[idx] = value     // R
    data[idx + 1] = value // G
    data[idx + 2] = value // B
    data[idx + 3] = 255   // A
  }

  return imageData
}

