/**
 * Vercel Serverless Function to check atlas cache status
 *
 * This endpoint checks if atlas images are already cached for a given image
 * and configuration, allowing the client to skip generation for cached images.
 *
 * Usage:
 * POST /api/check-atlas-cache
 * Body: { imageHash: string, min: number, max: number, step: number }
 *
 * Environment Variables Required:
 * - KV_URL, KV_REST_API_URL, KV_REST_API_TOKEN: Vercel KV credentials
 */

import { checkAtlasCacheStatus } from './lib/kv.js'

interface VercelRequest {
  method?: string
  body?: any
}

interface VercelResponse {
  status: (code: number) => VercelResponse
  json: (data: any) => VercelResponse
}

interface CheckCacheRequest {
  imageHash: string
  min: number
  max: number
  step: number
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { imageHash, min, max, step }: CheckCacheRequest = req.body

    // Validate input
    if (!imageHash || typeof min !== 'number' || typeof max !== 'number' || typeof step !== 'number') {
      return res.status(400).json({
        error: 'Invalid request. Required: { imageHash: string, min: number, max: number, step: number }'
      })
    }

    // Validate ranges
    if (min < -15 || max > 15 || min >= max || step <= 0) {
      return res.status(400).json({
        error: 'Invalid ranges. min/max must be within [-15, 15], min < max, step > 0'
      })
    }

    console.log(`[CHECK-CACHE] Checking cache status for hash=${imageHash.substring(0, 8)}... config=${min}:${max}:${step}`)

    // Check cache status
    const status = await checkAtlasCacheStatus(imageHash, min, max, step)

    console.log(`[CHECK-CACHE] Result: ${status.cached}/${status.total} cached`)

    return res.status(200).json({
      success: true,
      total: status.total,
      cached: status.cached,
      missing: status.missing,
      found: status.found,
    })
  } catch (error) {
    console.error('[CHECK-CACHE] Error checking cache:', error)
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error'
    })
  }
}
