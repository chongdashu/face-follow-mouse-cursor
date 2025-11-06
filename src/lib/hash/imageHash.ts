/**
 * Client-side image hashing utilities
 * Uses SubtleCrypto API for SHA256 hashing in the browser
 */

/**
 * Convert HTMLImageElement to base64 string (JPEG format)
 */
function imageToBase64(image: HTMLImageElement): string {
  const canvas = document.createElement('canvas')
  canvas.width = image.width
  canvas.height = image.height

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Could not get canvas context')
  }

  ctx.drawImage(image, 0, 0)

  // Get base64 without data URI prefix
  const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
  return dataUrl.replace(/^data:image\/jpeg;base64,/, '')
}

/**
 * Generate SHA256 hash from base64 string using SubtleCrypto API
 */
async function hashBase64(base64String: string): Promise<string> {
  // Convert base64 to ArrayBuffer
  const binaryString = atob(base64String)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }

  // Generate SHA256 hash
  const hashBuffer = await crypto.subtle.digest('SHA-256', bytes)

  // Convert ArrayBuffer to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

  return hashHex
}

/**
 * Generate a consistent hash from an HTMLImageElement
 * Uses SHA256 for cryptographic quality hashing
 *
 * @param image - HTMLImageElement to hash
 * @returns Promise<string> - SHA256 hash as hex string
 */
export async function hashImage(image: HTMLImageElement): Promise<string> {
  const base64 = imageToBase64(image)
  return hashBase64(base64)
}

/**
 * Generate a consistent hash from a base64 image string
 *
 * @param base64Image - Base64 encoded image (with or without data URI prefix)
 * @returns Promise<string> - SHA256 hash as hex string
 */
export async function hashImageFromBase64(base64Image: string): Promise<string> {
  // Remove data URI prefix if present
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '')
  return hashBase64(base64Data)
}
