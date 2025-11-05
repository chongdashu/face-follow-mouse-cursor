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
} as const;

