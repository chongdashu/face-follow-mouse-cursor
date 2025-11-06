import crypto from 'crypto'

/**
 * Generate a consistent hash from a base64 image string
 * Uses SHA256 for cryptographic quality hashing
 *
 * @param base64Image - Base64 encoded image (with or without data URI prefix)
 * @returns SHA256 hash as hex string
 */
export function hashImage(base64Image: string): string {
  // Remove data URI prefix if present (e.g., "data:image/jpeg;base64,")
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '')

  // Create hash from base64 data
  const hash = crypto.createHash('sha256')
  hash.update(base64Data)

  return hash.digest('hex')
}

/**
 * Generate a hash from image buffer
 * Useful when working with raw image data
 *
 * @param buffer - Image buffer
 * @returns SHA256 hash as hex string
 */
export function hashImageBuffer(buffer: Buffer): string {
  const hash = crypto.createHash('sha256')
  hash.update(buffer)
  return hash.digest('hex')
}
