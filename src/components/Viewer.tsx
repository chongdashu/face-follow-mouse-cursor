import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OnnxDepthRunner } from '../lib/depth/onnxRunner'
import { createScene, updateMeshSubdivisions } from '../lib/three/createScene'
import { CursorMapper } from '../lib/cursor/mapInput'
import { CONFIG } from '../config'
import Controls from './Controls'
import './Viewer.css'

interface ViewerProps {
  portraitImage: HTMLImageElement
  depthMap: ImageData | null
  onDepthReady?: (depth: ImageData) => void
  onReset: () => void
}

/**
 * Viewer component that renders the 3D scene with depth parallax
 */
export default function Viewer({ portraitImage, depthMap, onDepthReady, onReset }: ViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneStateRef = useRef<ReturnType<typeof createScene> | null>(null)
  const cursorMapperRef = useRef<CursorMapper>(new CursorMapper())
  const depthRunnerRef = useRef<OnnxDepthRunner | null>(null)
  const animationFrameRef = useRef<number>()

  const [isProcessing, setIsProcessing] = useState(!depthMap)
  const [error, setError] = useState<string | null>(null)
  const [intensity, setIntensity] = useState(100)
  const [smoothing, setSmoothing] = useState(50)
  const [showDebug, setShowDebug] = useState(false)
  const [currentRotation, setCurrentRotation] = useState({ yaw: 0, pitch: 0 })
  const [fps, setFps] = useState(0)

  // Initialize depth inference if needed
  useEffect(() => {
    if (depthMap || !portraitImage) return

    const runDepthInference = async () => {
      try {
        setIsProcessing(true)
        setError(null)

        // For PoC, we'll use a placeholder or try to load a model
        // In production, you'd have a model file in public/models/
        const modelPath = '/models/depth-anything-v2-small.onnx'
        
        const runner = new OnnxDepthRunner()
        await runner.initialize(modelPath)

        // Convert image to ImageData
        const canvas = document.createElement('canvas')
        canvas.width = portraitImage.width
        canvas.height = portraitImage.height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          throw new Error('Could not get canvas context')
        }
        ctx.drawImage(portraitImage, 0, 0)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

        // Run inference
        const result = await runner.infer(imageData, true)
        
        depthRunnerRef.current = runner
        if (onDepthReady) {
          onDepthReady(result.imageData)
        }
      } catch (err) {
        console.error('Depth inference error:', err)
        setError(err instanceof Error ? err.message : 'Failed to generate depth map')
        // Fallback: create a simple depth map
        const fallbackDepth = createFallbackDepth(portraitImage.width, portraitImage.height)
        if (onDepthReady) {
          onDepthReady(fallbackDepth)
        }
      } finally {
        setIsProcessing(false)
      }
    }

    runDepthInference()
  }, [portraitImage, depthMap, onDepthReady])

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current || !portraitImage || !depthMap) return

    try {
      // Create textures
      const portraitTexture = new THREE.TextureLoader().load(portraitImage.src)
      portraitTexture.flipY = false

      const depthCanvas = document.createElement('canvas')
      depthCanvas.width = depthMap.width
      depthCanvas.height = depthMap.height
      const depthCtx = depthCanvas.getContext('2d')
      if (!depthCtx) throw new Error('Could not get depth canvas context')
      depthCtx.putImageData(depthMap, 0, 0)
      const depthTexture = new THREE.Texture(depthCanvas)
      depthTexture.flipY = false
      depthTexture.needsUpdate = true

      // Create scene
      const state = createScene(
        containerRef.current,
        portraitTexture,
        depthTexture,
        CONFIG.meshSubdivisions
      )
      sceneStateRef.current = state

      // Cleanup
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
        state.renderer.dispose()
        portraitTexture.dispose()
        depthTexture.dispose()
        if (depthRunnerRef.current) {
          depthRunnerRef.current.dispose()
        }
      }
    } catch (err) {
      console.error('Scene initialization error:', err)
      setError(err instanceof Error ? err.message : 'Failed to initialize scene')
    }
  }, [portraitImage, depthMap])

  // Handle cursor input
  useEffect(() => {
    if (!containerRef.current || !sceneStateRef.current) return

    const container = containerRef.current
    const material = sceneStateRef.current.material

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const rect = container.getBoundingClientRect()
      let clientX: number
      let clientY: number

      if (e instanceof MouseEvent) {
        clientX = e.clientX
        clientY = e.clientY
      } else {
        const touch = e.touches[0]
        if (!touch) return
        clientX = touch.clientX
        clientY = touch.clientY
      }

      const x = clientX - rect.left
      const y = clientY - rect.top

      const rotation = cursorMapperRef.current.map(
        x,
        y,
        rect.width,
        rect.height
      )

      // Update uniforms
      material.uniforms.yaw.value = rotation.yaw
      material.uniforms.pitch.value = rotation.pitch
      setCurrentRotation(rotation)
    }

    container.addEventListener('mousemove', handleMove)
    container.addEventListener('touchmove', handleMove, { passive: false })

    return () => {
      container.removeEventListener('mousemove', handleMove)
      container.removeEventListener('touchmove', handleMove)
    }
  }, [])

  // Animation loop
  useEffect(() => {
    if (!sceneStateRef.current) return

    const state = sceneStateRef.current
    let lastTime = performance.now()
    let frameCount = 0
    let lastFpsUpdate = performance.now()

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate)

      const now = performance.now()
      const deltaTime = now - lastTime
      lastTime = now

      // Update FPS counter
      frameCount++
      if (now - lastFpsUpdate > 1000) {
        setFps(frameCount)
        frameCount = 0
        lastFpsUpdate = now

        // Performance check: reduce subdivisions if frame time is too high
        if (deltaTime > CONFIG.frameTimeThreshold && state.mesh.geometry instanceof THREE.PlaneGeometry) {
          const currentSegments = state.mesh.geometry.parameters.widthSegments
          if (currentSegments > CONFIG.meshSubdivisionsFallback) {
            updateMeshSubdivisions(state.mesh, CONFIG.meshSubdivisionsFallback)
            console.log('Reduced mesh subdivisions for performance')
          }
        }
      }

      state.renderer.render(state.scene, state.camera)
    }

    animate()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  // Update intensity (depth scale)
  useEffect(() => {
    if (!sceneStateRef.current) return
    const scale = (intensity / 100) * (CONFIG.depthScaleMax - CONFIG.depthScaleMin) + CONFIG.depthScaleMin
    sceneStateRef.current.material.uniforms.depthScale.value = scale
  }, [intensity])

  // Update smoothing
  useEffect(() => {
    cursorMapperRef.current.setSmoothing(smoothing)
  }, [smoothing])

  // Create fallback depth map (simple radial gradient)
  const createFallbackDepth = (width: number, height: number): ImageData => {
    const imageData = new ImageData(width, height)
    const centerX = width / 2
    const centerY = height / 2
    const maxDist = Math.sqrt(centerX ** 2 + centerY ** 2)

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = x - centerX
        const dy = y - centerY
        const dist = Math.sqrt(dx ** 2 + dy ** 2)
        const normalized = Math.min(dist / maxDist, 1)
        const value = Math.floor(normalized * 255)

        const idx = (y * width + x) * 4
        imageData.data[idx] = value
        imageData.data[idx + 1] = value
        imageData.data[idx + 2] = value
        imageData.data[idx + 3] = 255
      }
    }

    return imageData
  }

  if (isProcessing) {
    return (
      <div className="viewer-container">
        <div className="processing-overlay">
          <div className="spinner"></div>
          <p>Generating depth map...</p>
          <p className="processing-hint">This may take a few seconds</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="viewer-container">
        <div className="error-overlay">
          <p>Error: {error}</p>
          <p className="error-hint">Using fallback depth map</p>
        </div>
        <div ref={containerRef} className="viewer-canvas" />
        <Controls
          intensity={intensity}
          smoothing={smoothing}
          showDebug={showDebug}
          onIntensityChange={setIntensity}
          onSmoothingChange={setSmoothing}
          onToggleDebug={() => setShowDebug(!showDebug)}
          onReset={onReset}
          rotation={currentRotation}
          fps={fps}
        />
      </div>
    )
  }

  return (
    <div className="viewer-container">
      <div ref={containerRef} className="viewer-canvas" />
      <Controls
        intensity={intensity}
        smoothing={smoothing}
        showDebug={showDebug}
        onIntensityChange={setIntensity}
        onSmoothingChange={setSmoothing}
        onToggleDebug={() => setShowDebug(!showDebug)}
        onReset={onReset}
        rotation={currentRotation}
        fps={fps}
      />
    </div>
  )
}

