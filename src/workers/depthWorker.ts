import * as ort from 'onnxruntime-web'

export interface DepthWorkerMessage {
  type: 'init' | 'infer' | 'error'
  payload?: any
  error?: string
}

/**
 * Web Worker for depth inference using ONNX Runtime
 */
self.onmessage = async (e: MessageEvent<DepthWorkerMessage>) => {
  const { type, payload } = e.data

  try {
    if (type === 'init') {
      // Initialize ONNX session
      const session = await ort.InferenceSession.create(
        payload.modelPath,
        {
          executionProviders: ['webgpu', 'webgl', 'wasm', 'cpu']
        }
      )
      self.postMessage({ type: 'init', payload: { success: true } })
    } else if (type === 'infer') {
      // Run inference
      const { imageData, modelPath } = payload
      const session = await ort.InferenceSession.create(
        modelPath,
        {
          executionProviders: ['webgpu', 'webgl', 'wasm', 'cpu']
        }
      )

      // Preprocess image
      const tensor = preprocessImage(imageData)

      // Run inference
      const feeds = { [session.inputNames[0]]: tensor }
      const results = await session.run(feeds)
      const output = results[session.outputNames[0]]

      // Extract depth data
      const depthData = output.data as Float32Array
      const width = output.dims[output.dims.length - 1]
      const height = output.dims[output.dims.length - 2]

      self.postMessage({
        type: 'infer',
        payload: {
          depthData: Array.from(depthData),
          width,
          height
        }
      })
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error instanceof Error ? error.message : String(error)
    })
  }
}

/**
 * Preprocess image to tensor format expected by depth model
 * Assumes model expects NCHW format with normalized values
 */
function preprocessImage(imageData: ImageData): ort.Tensor {
  const { width, height, data } = imageData
  const channels = 3 // RGB
  const size = width * height * channels

  // Convert RGBA to RGB and normalize to [0, 1]
  const tensorData = new Float32Array(size)
  for (let i = 0; i < width * height; i++) {
    const r = data[i * 4] / 255.0
    const g = data[i * 4 + 1] / 255.0
    const b = data[i * 4 + 2] / 255.0

    // NCHW format: [batch, channel, height, width]
    tensorData[i] = r                      // R channel
    tensorData[width * height + i] = g      // G channel
    tensorData[width * height * 2 + i] = b  // B channel
  }

  return new ort.Tensor('float32', tensorData, [1, channels, height, width])
}

