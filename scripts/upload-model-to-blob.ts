/**
 * Script to upload the depth model to Vercel Blob Storage
 * 
 * Usage:
 * 1. Set BLOB_READ_WRITE_TOKEN in your environment or .env.local
 * 2. Run: npx tsx scripts/upload-model-to-blob.ts
 * 
 * Or use the Vercel CLI:
 * vercel blob put public/models/depth-anything-v2-small.onnx --token YOUR_TOKEN
 */

import { putBlob } from '@vercel/blob'
import { readFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function uploadModel() {
  const token = process.env.BLOB_READ_WRITE_TOKEN
  
  if (!token) {
    console.error('❌ BLOB_READ_WRITE_TOKEN not found in environment')
    console.error('   Set it in .env.local or export it:')
    console.error('   export BLOB_READ_WRITE_TOKEN=your_token_here')
    process.exit(1)
  }

  const modelPath = join(__dirname, '../public/models/depth-anything-v2-small.onnx')
  const blobKey = 'depth-anything-v2-small.onnx'

  try {
    console.log('📤 Reading model file...')
    const fileBuffer = readFileSync(modelPath)
    const fileSizeMB = (fileBuffer.length / (1024 * 1024)).toFixed(2)
    console.log(`   File size: ${fileSizeMB} MB`)

    console.log('📦 Uploading to Vercel Blob Storage...')
    const blob = await putBlob(blobKey, fileBuffer, {
      token,
      contentType: 'application/octet-stream',
      addRandomSuffix: false
    })

    console.log('✅ Model uploaded successfully!')
    console.log(`   Blob URL: ${blob.url}`)
    console.log(`   Blob Key: ${blobKey}`)
    console.log('\n📝 Next steps:')
    console.log('   1. Set BLOB_READ_WRITE_TOKEN in Vercel environment variables')
    console.log('   2. Update config.ts: modelPath: "/api/model"')
    console.log('   3. Deploy to Vercel')
  } catch (error: any) {
    console.error('❌ Upload failed:', error.message)
    process.exit(1)
  }
}

uploadModel()

