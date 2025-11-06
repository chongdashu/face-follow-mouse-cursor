/**
 * Configuration constants for the face-follow cursor demo
 */

export const CONFIG = {
  // Angle clamps (degrees)
  yawRange: 12,
  pitchRange: 8,

  // Smoothing
  emaAlpha: 0.2,
  emaAlphaMin: 0.1,
  emaAlphaMax: 0.35,

  // Dead zone (percentage of min viewport dimension)
  deadZone: 0.08,

  // Depth scale (near-to-far displacement as percentage of plane size)
  depthScale: 0.015, // 1.5%
  depthScaleMin: 0.01,
  depthScaleMax: 0.025,

  // Mesh subdivisions
  meshSubdivisions: 128,
  meshSubdivisionsFallback: 64,

  // Texture sizes
  textureSize: 1024,
  textureSizeFallback: 768,

  // Image processing
  maxImageWidth: 1024,

  // Performance thresholds
  targetFPS: 60,
  frameTimeThreshold: 16.7, // ms

  // Debug: skip model loading and use fallback immediately
  // Set to true to test without ONNX model
  useFallbackOnly: false,

  // Model path configuration
  // For local development: '/models/depth-anything-v2-small.onnx'
  // For production (CDN): Use Hugging Face CDN URL or Vercel Blob URL
  // Leave empty to try local first, then fallback to CDN
  modelPath: '', // Empty = auto-detect (local first, then CDN)
  
  // CDN fallback URL (used if local model not found)
  // Hugging Face CDN URLs for Depth Anything V2 models:
  // - Small (recommended for web): https://huggingface.co/onnx-community/depth-anything-v2-small/resolve/main/onnx/model.onnx
  // - Large q4f16 (235MB, best balance): https://huggingface.co/onnx-community/depth-anything-v2-large/resolve/main/onnx/model_q4f16.onnx
  // - Large fp16 (669MB, high quality): https://huggingface.co/onnx-community/depth-anything-v2-large/resolve/main/onnx/model_fp16.onnx
  modelCdnUrl: 'https://huggingface.co/onnx-community/depth-anything-v2-small/resolve/main/onnx/model.onnx',
} as const;

/**
 * Atlas mode configuration (for dynamic gaze image generation)
 */
export const ATLAS_CONFIG = {
  // Grid parameters for gaze generation
  min: -15,
  max: 15,
  step: 3,
  size: 1024,

  // Fallback image when specific grid position not found
  fallbackImage: 'px0_py0',

  // Cursor debounce for image swapping (ms)
  debounceMs: 16,

  // Preload radius (how many neighbors to preload)
  preloadRadius: 1,
} as const;

