/**
 * Vercel Serverless Function to serve the depth model from Vercel Blob Storage
 *
 * This endpoint streams the model file from Vercel Blob Storage, allowing
 * you to store large model files without committing them to git.
 *
 * Usage:
 * GET /api/model
 *
 * Environment Variables Required:
 * - BLOB_READ_WRITE_TOKEN: Vercel Blob Storage token (get from Vercel dashboard)
 *
 * Setup:
 * 1. Install @vercel/blob: npm install @vercel/blob
 * 2. Upload your model to Vercel Blob Storage (see instructions below)
 * 3. Set BLOB_READ_WRITE_TOKEN in Vercel environment variables
 * 4. Update config.ts to use: modelPath: '/api/model'
 */

import { getBlob } from '@vercel/blob'

interface VercelRequest {
  method?: string
}

interface VercelResponse {
  status: (code: number) => VercelResponse
  setHeader: (name: string, value: string) => VercelResponse
  send: (data: any) => void
  json: (data: any) => void
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get blob token from environment
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN
    if (!blobToken) {
      return res.status(500).json({
        error: 'BLOB_READ_WRITE_TOKEN not configured. Please set it in your Vercel environment variables.'
      })
    }

    // The blob key/name - update this to match your uploaded file name
    const blobKey = 'depth-anything-v2-small.onnx'

    // Fetch the blob
    const blob = await getBlob(blobKey, {
      token: blobToken
    })

    // Set appropriate headers for ONNX file
    res.setHeader('Content-Type', 'application/octet-stream')
    res.setHeader('Content-Disposition', `attachment; filename="${blobKey}"`)
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')

    // Stream the blob data
    return res.send(blob)
  } catch (error: any) {
    console.error('[MODEL-API] Error serving model:', error)
    return res.status(500).json({
      error: error.message || 'Failed to serve model file'
    })
  }
}

