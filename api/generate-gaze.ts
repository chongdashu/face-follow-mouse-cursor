/**
 * Vercel Serverless Function for generating gaze images via Replicate API
 * 
 * This endpoint securely handles Replicate API calls without exposing the API key
 * to the client-side code.
 * 
 * Usage:
 * POST /api/generate-gaze
 * Body: { image: base64Image, px: number, py: number }
 * 
 * Environment Variables Required:
 * - REPLICATE_API_TOKEN: Your Replicate API token
 */

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
  image: string // Base64 encoded image
  px: number    // Horizontal gaze angle (-15 to 15)
  py: number    // Vertical gaze angle (-15 to 15)
}

interface ReplicatePrediction {
  id: string
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled'
  output?: string // URL to generated image
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
    const { image, px, py }: GenerateGazeRequest = req.body

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

    // Convert base64 to data URL if needed
    const imageData = image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`

    // Create prediction on Replicate using kylan02/face-looker model
    const predictionResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'kylan02/face-looker', // Use the correct face-looker model
        input: {
          image: imageData,
          px: px,        // Changed from pupil_x to px
          py: py,        // Changed from pupil_y to py
          image_size: 256, // Output image size
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
      return res.status(200).json({
        success: true,
        imageUrl: finalPrediction.output,
        px,
        py,
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

