import { kv } from '@vercel/kv'

/**
 * Atlas cache entry structure
 */
export interface AtlasCacheEntry {
  imageUrl: string
  px: number
  py: number
  timestamp: number
  imageHash: string
}

/**
 * Cache configuration
 */
const CACHE_CONFIG = {
  // Cache TTL: 30 days (in seconds)
  TTL: 30 * 24 * 60 * 60,

  // Key prefix for atlas cache entries
  PREFIX: 'atlas',
}

/**
 * Build cache key for an atlas image
 */
export function buildCacheKey(imageHash: string, px: number, py: number): string {
  return `${CACHE_CONFIG.PREFIX}:${imageHash}:px${px}_py${py}`
}

/**
 * Get cached atlas image URL
 * Returns null if not found or if Replicate URL has expired
 */
export async function getCachedAtlasImage(
  imageHash: string,
  px: number,
  py: number
): Promise<string | null> {
  try {
    const key = buildCacheKey(imageHash, px, py)
    const entry = await kv.get<AtlasCacheEntry>(key)

    if (!entry) {
      return null
    }

    // Verify URL is still valid (HEAD request to Replicate)
    try {
      const response = await fetch(entry.imageUrl, { method: 'HEAD' })
      if (!response.ok) {
        console.warn(`[CACHE] URL expired for key ${key}, status: ${response.status}`)
        // Clean up expired entry
        await kv.del(key)
        return null
      }
    } catch (urlError) {
      console.warn(`[CACHE] URL check failed for key ${key}:`, urlError)
      await kv.del(key)
      return null
    }

    return entry.imageUrl
  } catch (error) {
    console.error('[CACHE] Error getting cached image:', error)
    return null
  }
}

/**
 * Store atlas image URL in cache
 */
export async function setCachedAtlasImage(
  imageHash: string,
  px: number,
  py: number,
  imageUrl: string
): Promise<void> {
  try {
    const key = buildCacheKey(imageHash, px, py)
    const entry: AtlasCacheEntry = {
      imageUrl,
      px,
      py,
      timestamp: Date.now(),
      imageHash,
    }

    await kv.set(key, entry, { ex: CACHE_CONFIG.TTL })
    console.log(`[CACHE] Stored: ${key}`)
  } catch (error) {
    console.error('[CACHE] Error setting cached image:', error)
    // Don't throw - caching is optional
  }
}

/**
 * Check cache status for an entire atlas configuration
 * Returns array of cache keys and their status
 */
export async function checkAtlasCacheStatus(
  imageHash: string,
  min: number,
  max: number,
  step: number
): Promise<{
  total: number
  cached: number
  missing: Array<{ px: number; py: number; key: string }>
  found: Array<{ px: number; py: number; key: string; url: string }>
}> {
  const angles: number[] = []
  for (let angle = min; angle <= max; angle += step) {
    angles.push(angle)
  }

  const missing: Array<{ px: number; py: number; key: string }> = []
  const found: Array<{ px: number; py: number; key: string; url: string }> = []

  // Check each angle combination
  for (const px of angles) {
    for (const py of angles) {
      const key = buildCacheKey(imageHash, px, py)
      const url = await getCachedAtlasImage(imageHash, px, py)

      if (url) {
        found.push({ px, py, key, url })
      } else {
        missing.push({ px, py, key })
      }
    }
  }

  const total = angles.length * angles.length

  return {
    total,
    cached: found.length,
    missing,
    found,
  }
}

/**
 * Clear all cached atlas images for a specific image hash
 * Note: Vercel KV doesn't support SCAN pattern matching
 * This function is a placeholder for future implementation
 */
export async function clearAtlasCache(imageHash: string): Promise<number> {
  try {
    // Note: Vercel KV doesn't support SCAN, so we need to track keys separately
    // For now, this is a placeholder - consider implementing a key index if needed
    console.warn(`[CACHE] Clear cache not fully implemented for hash ${imageHash.substring(0, 8)}...`)

    return 0
  } catch (error) {
    console.error('[CACHE] Error clearing cache:', error)
    return 0
  }
}
