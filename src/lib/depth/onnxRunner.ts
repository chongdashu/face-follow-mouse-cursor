import * as ort from 'onnxruntime-web'
import { normalizeDepth, smoothDepth, depthToImageData } from './normalize'

export interface DepthInferenceOptions {
  modelPath: string
  imageData: ImageData
  smoothing?: boolean
}

export interface DepthResult {
  imageData: ImageData
  rawDepth: Float32Array
}

/**
 * Runner for ONNX depth model inference
 * Handles model loading, inference, and post-processing
 */
export class OnnxDepthRunner {
  private session: any = null
  private executionProviders: string[] = ['webgpu', 'webgl', 'wasm', 'cpu']

  /**
   * Initialize ONNX session with fallback execution providers
   */
  async initialize(modelPath: string): Promise<void> {
    // modelPath is used by ort.InferenceSession.create() below

    // Try execution providers in order
    for (const ep of this.executionProviders) {
      try {
        this.session = await ort.InferenceSession.create(modelPath, {
          executionProviders: [ep]
        })
        console.log(`ONNX Runtime initialized with ${ep}`)
        return
      } catch (error) {
        console.warn(`Failed to initialize with ${ep}:`, error)
        continue
      }
    }

    throw new Error('Failed to initialize ONNX Runtime with any execution provider')
  }

  /**
   * Run depth inference on image
   */
  async infer(imageData: ImageData, smoothing = true): Promise<DepthResult> {
    if (!this.session) {
      throw new Error('ONNX session not initialized. Call initialize() first.')
    }

    // Preprocess image
    const tensor = this.preprocessImage(imageData)

    // Run inference
    const inputName = this.session.inputNames[0]
    const feeds = { [inputName]: tensor }
    const results = await this.session.run(feeds)
    const output = results[this.session.outputNames[0]]

    // Extract depth data
    const depthData = output.data as Float32Array
    const width = output.dims[output.dims.length - 1]
    const height = output.dims[output.dims.length - 2]

    // Flatten depth data if needed (handle different output shapes)
    let flatDepth: Float32Array
    if (depthData.length === width * height) {
      flatDepth = depthData
    } else if (depthData.length === width * height * 2) {
      // Some models output 2 channels, take the first
      flatDepth = new Float32Array(width * height)
      for (let i = 0; i < width * height; i++) {
        flatDepth[i] = depthData[i * 2]
      }
    } else {
      // Try to reshape
      flatDepth = new Float32Array(depthData.slice(0, width * height))
    }

    // Normalize
    let normalized = normalizeDepth(flatDepth)

    // Optional smoothing
    if (smoothing) {
      normalized = smoothDepth(normalized, width, height, 2.0, 0.1)
    }

    // Convert to ImageData
    const resultImageData = depthToImageData(normalized, width, height)

    return {
      imageData: resultImageData,
      rawDepth: normalized
    }
  }

  /**
   * Preprocess image to tensor format expected by depth model
   * Assumes model expects NCHW format with normalized values [0, 1]
   */
  private preprocessImage(imageData: ImageData): any {
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

  /**
   * Dispose resources
   */
  dispose(): void {
    if (this.session) {
      // ONNX Runtime sessions don't have explicit dispose, but we can clear the reference
      this.session = null
    }
  }
}

