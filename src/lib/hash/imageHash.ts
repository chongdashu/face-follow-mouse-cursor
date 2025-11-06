/**
 * Client-side image hashing utilities
 * Uses SubtleCrypto API for SHA256 hashing in the browser
 * Supports deterministic pixel-based hashing and URL-based fallback for demo images
 */

/**
 * Generate SHA256 hash from raw pixel data (ImageData)
 * Deterministic across all browsers - same pixels always produce the same hash
 *
 * @param imageData - ImageData object containing pixel data
 * @returns Promise<string> - SHA256 hash as hex string
 */
export async function hashImageData(imageData: ImageData): Promise<string> {
  const bytes = imageData.data
  const hashBuffer = await crypto.subtle.digest('SHA-256', bytes)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

/**
 * Generate a deterministic hash from raw pixel data of an HTMLImageElement
 * Extracts pixel data from canvas without JPEG compression
 * Produces identical hashes across all browsers for the same image
 *
 * @param image - HTMLImageElement to hash
 * @returns Promise<string> - SHA256 hash as hex string
 */
export async function hashImagePixels(image: HTMLImageElement): Promise<string> {
  const canvas = document.createElement('canvas')
  canvas.width = image.width
  canvas.height = image.height

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Could not get canvas context')
  }

  ctx.drawImage(image, 0, 0)
  const imageData = ctx.getImageData(0, 0, image.width, image.height)
  return hashImageData(imageData)
}

/**
 * Generate a deterministic hash from an image URL
 * Useful as a fallback when pixel hashing fails (e.g., CORS-blocked images)
 * Produces identical hashes for the same URL across all browsers
 *
 * @param url - Image URL string
 * @returns Promise<string> - SHA256 hash as hex string
 */
export async function hashImageUrl(url: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(url)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

/**
 * Generate a consistent hash from an HTMLImageElement
 * Prefers raw pixel-based hashing for determinism across browsers
 * Uses SHA256 for cryptographic quality hashing
 *
 * @param image - HTMLImageElement to hash
 * @returns Promise<string> - SHA256 hash as hex string
 */
export async function hashImage(image: HTMLImageElement): Promise<string> {
  return hashImagePixels(image)
}

/**
 * Legacy function for base64 image hashing (JPEG-based)
 * Kept for backward compatibility but not recommended for cache keys
 * as JPEG compression is non-deterministic across browsers
 *
 * @param base64Image - Base64 encoded image (with or without data URI prefix)
 * @returns Promise<string> - SHA256 hash as hex string
 */
export async function hashImageFromBase64(base64Image: string): Promise<string> {
  // Convert base64 to ArrayBuffer for hashing
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '')
  const binaryString = atob(base64Data)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }

  const hashBuffer = await crypto.subtle.digest('SHA-256', bytes)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

  return hashHex
}
