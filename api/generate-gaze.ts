/**
 * Vercel Serverless Function for generating gaze images via Replicate API
 *
 * This endpoint securely handles Replicate API calls without exposing the API key
 * to the client-side code. Includes caching via Vercel KV to avoid regenerating
 * previously processed images.
 *
 * Usage:
 * POST /api/generate-gaze
 * Body: { image: base64Image, px: number, py: number, imageHash?: string }
 *
 * Environment Variables Required:
 * - REPLICATE_API_TOKEN: Your Replicate API token
 * - KV_URL, KV_REST_API_URL, KV_REST_API_TOKEN: Vercel KV credentials
 */

import { hashImage } from './lib/imageHash.js'
import { getCachedAtlasImage, setCachedAtlasImage } from './lib/kv.js'

// Vercel serverless function types
interface VercelRequest {
  method?: string
  body?: any
}

interface VercelResponse {
  status: (code: number) => VercelResponse
  json: (data: any) => VercelResponse
}

interface GenerateGazeRequest {
  image: string       // Base64 encoded image
  px: number          // Horizontal gaze angle (-15 to 15)
  py: number          // Vertical gaze angle (-15 to 15)
  imageHash?: string  // Optional pre-computed hash (for cache lookup)
}

interface ReplicatePrediction {
  id: string
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled'
  output?: string | string[] // URL(s) to generated image(s)
  error?: string
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Check for API token
  const apiToken = process.env.REPLICATE_API_TOKEN
  if (!apiToken) {
    return res.status(500).json({ 
      error: 'REPLICATE_API_TOKEN not configured. Please set it in your Vercel environment variables.' 
    })
  }

  try {
    const { image, px, py, imageHash: providedHash }: GenerateGazeRequest = req.body

    // Validate input
    if (!image || typeof px !== 'number' || typeof py !== 'number') {
      return res.status(400).json({
        error: 'Invalid request. Required: { image: string, px: number, py: number }'
      })
    }

    // Validate gaze angles (typically -15 to 15)
    if (px < -15 || px > 15 || py < -15 || py > 15) {
      return res.status(400).json({
        error: 'Gaze angles must be between -15 and 15'
      })
    }

    // Compute or use provided image hash
    const imageHash = providedHash || hashImage(image)
    console.log(`[GENERATE-GAZE] Request for px=${px}, py=${py}, hash=${imageHash.substring(0, 8)}...`)

    // Check cache first
    const cachedUrl = await getCachedAtlasImage(imageHash, px, py)
    if (cachedUrl) {
      console.log(`[GENERATE-GAZE] Cache HIT for px=${px}, py=${py}`)
      return res.status(200).json({
        success: true,
        imageUrl: cachedUrl,
        px,
        py,
        cached: true,
      })
    }

    console.log(`[GENERATE-GAZE] Cache MISS for px=${px}, py=${py}, calling Replicate...`)

    // Convert base64 to data URL if needed
    const imageData = image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`

    // Create prediction on Replicate
    const predictionResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'fofr/expression-editor:bf913bc90e1c44ba288ba3942a538693b72e8cc7df576f3beebe56adc0a92b86',
        input: {
          image: imageData,
          pupil_x: px,
          pupil_y: py,
        },
      }),
    })

    if (!predictionResponse.ok) {
      const error = await predictionResponse.text()
      console.error('Replicate API error:', error)
      return res.status(predictionResponse.status).json({ 
        error: `Replicate API error: ${error}` 
      })
    }

    const prediction: ReplicatePrediction = await predictionResponse.json()

    // Poll for completion (or return immediately and let client poll)
    // For simplicity, we'll poll here up to 60 seconds
    let finalPrediction = prediction
    const maxAttempts = 60
    let attempts = 0

    while (
      finalPrediction.status === 'starting' || 
      finalPrediction.status === 'processing'
    ) {
      if (attempts >= maxAttempts) {
        return res.status(504).json({ 
          error: 'Generation timeout after 60 seconds',
          predictionId: finalPrediction.id 
        })
      }

      await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second

      const statusResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${finalPrediction.id}`,
        {
          headers: {
            'Authorization': `Token ${apiToken}`,
          },
        }
      )

      if (!statusResponse.ok) {
        return res.status(statusResponse.status).json({ 
          error: 'Failed to check prediction status' 
        })
      }

      finalPrediction = await statusResponse.json()
      attempts++
    }

    if (finalPrediction.status === 'failed' || finalPrediction.status === 'canceled') {
      return res.status(500).json({ 
        error: finalPrediction.error || 'Generation failed',
        predictionId: finalPrediction.id 
      })
    }

    if (finalPrediction.status === 'succeeded' && finalPrediction.output) {
      // Handle both single string and array of strings from Replicate API
      const imageUrl = Array.isArray(finalPrediction.output)
        ? finalPrediction.output[0]
        : finalPrediction.output

      // Store in cache for future requests
      await setCachedAtlasImage(imageHash, px, py, imageUrl)

      return res.status(200).json({
        success: true,
        imageUrl,
        px,
        py,
        cached: false,
      })
    }

    return res.status(500).json({ 
      error: 'Unexpected prediction status',
      status: finalPrediction.status 
    })

  } catch (error) {
    console.error('Error generating gaze image:', error)
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    })
  }
}

