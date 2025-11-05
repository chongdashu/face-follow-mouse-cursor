import { useEffect, useRef, useState, useMemo } from 'react'
import * as THREE from 'three'
import { OnnxDepthRunner } from '../lib/depth/onnxRunner'
import { createScene, updateMeshSubdivisions } from '../lib/three/createScene'
import { CursorMapper } from '../lib/cursor/mapInput'
import { useAtlasMode } from '../lib/atlas/useAtlasMode'
import { CONFIG, ATLAS_CONFIG } from '../config'
import Controls from './Controls'
import './Viewer.css'

interface ViewerProps {
  portraitImage: HTMLImageElement
  depthMap: ImageData | null
  generatedAtlas?: Map<string, string> | null
  atlasError?: string | null
  onDepthReady?: (depth: ImageData) => void
  onGenerateAtlas?: () => void
  onResetAtlas?: () => void
  onReset: () => void
}

/**
 * Viewer component that renders the 3D scene with depth parallax
 * Supports optional atlas mode for hybrid depth + gaze direction effects
 */
export default function Viewer({
  portraitImage,
  depthMap,
  generatedAtlas,
  atlasError,
  onDepthReady,
  onGenerateAtlas,
  onResetAtlas,
  onReset
}: ViewerProps) {

  const containerRef = useRef<HTMLDivElement>(null)
  const sceneStateRef = useRef<ReturnType<typeof createScene> | null>(null)
  const cursorMapperRef = useRef<CursorMapper>(new CursorMapper())
  const depthRunnerRef = useRef<OnnxDepthRunner | null>(null)
  const animationFrameRef = useRef<number>()
  const atlasTextureRef = useRef<THREE.Texture | null>(null)
  const mousePositionRef = useRef({ x: 0, y: 0 })

  const [isProcessing, setIsProcessing] = useState(!depthMap)
  const [error, setError] = useState<string | null>(null)
  const [intensity, setIntensity] = useState(100)
  const [smoothing, setSmoothing] = useState(50)
  const [yawRange, setYawRange] = useState<number>(CONFIG.yawRange)
  const [pitchRange, setPitchRange] = useState<number>(CONFIG.pitchRange)
  const [deadZonePercent, setDeadZonePercent] = useState(Math.round(CONFIG.deadZone * 100))
  const [showDebug, setShowDebug] = useState(false)
  const [currentRotation, setCurrentRotation] = useState({ yaw: 0, pitch: 0 })
  const [fps, setFps] = useState(0)
  const [sceneReady, setSceneReady] = useState(false)

  // Atlas mode state
  const [currentAtlasImageUrl, setCurrentAtlasImageUrl] = useState<string | null>(null)
  const [currentGridCoords, setCurrentGridCoords] = useState<{ px: number; py: number } | null>(null)
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 })
  const [atlasMousePosition, setAtlasMousePosition] = useState({ x: 0, y: 0 })

  // Initialize depth inference if needed
  useEffect(() => {
    console.log('[Viewer] Depth inference effect triggered:', { 
      hasDepthMap: !!depthMap, 
      hasPortrait: !!portraitImage 
    })
    
    if (depthMap || !portraitImage) {
      console.log('[Viewer] Skipping depth inference:', { 
        reason: depthMap ? 'depthMap exists' : 'no portraitImage' 
      })
      return
    }

    console.log('[Viewer] Starting depth inference...')
    const runDepthInference = async () => {
      try {
        setIsProcessing(true)
        setError(null)

        // Check if we should skip model loading (for testing)
        if (CONFIG.useFallbackOnly) {
          console.log('Skipping model loading (useFallbackOnly=true), using fallback depth map')
          throw new Error('Using fallback depth map (debug mode)')
        }

        // For PoC, we'll use a placeholder or try to load a model
        // In production, you'd have a model file in public/models/
        const modelPath = '/models/depth-anything-v2-small.onnx'
        
        console.log('Attempting to load ONNX model from:', modelPath)
        
        // First, check if model file exists
        try {
          const response = await fetch(modelPath, { method: 'HEAD' })
          if (!response.ok) {
            console.warn(`Model file not found (status: ${response.status}). Using fallback depth map.`)
            throw new Error(`Model file not found at ${modelPath}. Using fallback depth map.`)
          }
          console.log('Model file found, initializing ONNX Runtime...')
        } catch (fetchError) {
          console.warn('Model file check failed, using fallback depth map:', fetchError)
          throw new Error('Model file not found. Using fallback depth map.')
        }
        
        const runner = new OnnxDepthRunner()
        console.log('Initializing ONNX Runtime...')
        await runner.initialize(modelPath)
        console.log('ONNX Runtime initialized successfully')

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
        console.warn('Depth inference error, using fallback:', err)
        const errorMessage = err instanceof Error ? err.message : 'Failed to generate depth map'
        setError(errorMessage)
        
        // Always provide fallback depth map
        try {
          console.log('[Viewer] Creating fallback depth map...')
          const fallbackDepth = createFallbackDepth(portraitImage.width, portraitImage.height)
          console.log('[Viewer] Fallback depth map created:', {
            width: fallbackDepth.width,
            height: fallbackDepth.height
          })
          if (onDepthReady) {
            console.log('[Viewer] Calling onDepthReady with fallback depth map')
            onDepthReady(fallbackDepth)
          } else {
            console.warn('[Viewer] onDepthReady callback not provided!')
          }
        } catch (fallbackError) {
          console.error('[Viewer] Failed to create fallback depth map:', fallbackError)
          setError('Failed to process image. Please try again.')
        }
      } finally {
        console.log('[Viewer] Depth inference complete, setting isProcessing to false')
        setIsProcessing(false)
      }
    }

    runDepthInference()
  }, [portraitImage, depthMap, onDepthReady])

  // Initialize Three.js scene
  useEffect(() => {
    console.log('[Viewer] Scene initialization effect triggered:', {
      hasContainer: !!containerRef.current,
      hasPortrait: !!portraitImage,
      hasDepthMap: !!depthMap,
      containerDimensions: containerRef.current ? {
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight
      } : 'no container'
    })
    
    if (!containerRef.current || !portraitImage || !depthMap) {
      console.log('[Viewer] Skipping scene init:', {
        missingContainer: !containerRef.current,
        missingPortrait: !portraitImage,
        missingDepthMap: !depthMap
      })
      return
    }

    let state: ReturnType<typeof createScene> | null = null
    let portraitTexture: THREE.Texture | null = null
    let depthTexture: THREE.Texture | null = null
    let isMounted = true

    const initScene = async () => {
      try {
        console.log('[Viewer] ===== Starting Three.js scene initialization =====')
        console.log('[Viewer] Portrait image src:', portraitImage.src)
        console.log('[Viewer] Portrait image dimensions:', portraitImage.width, 'x', portraitImage.height)
        console.log('[Viewer] Portrait image complete:', portraitImage.complete)
        console.log('[Viewer] Portrait image naturalWidth:', portraitImage.naturalWidth)
        console.log('[Viewer] Depth map dimensions:', depthMap.width, 'x', depthMap.height)
        
        // Ensure image is loaded
        if (!portraitImage.complete || portraitImage.naturalWidth === 0) {
          console.log('[Viewer] Waiting for portrait image to load...')
          await new Promise<void>((resolve, reject) => {
            const img = portraitImage!
            if (img.complete) {
              console.log('[Viewer] Portrait image already complete')
              resolve()
            } else {
              console.log('[Viewer] Setting up load handlers for portrait image')
              img.onload = () => {
                console.log('[Viewer] Portrait image loaded via onload handler')
                resolve()
              }
              img.onerror = () => {
                console.error('[Viewer] Portrait image failed to load')
                reject(new Error('Failed to load portrait image'))
              }
            }
          })
        } else {
          console.log('[Viewer] Portrait image already loaded')
        }

        // Create portrait texture using canvas (immediate availability)
        const portraitCanvas = document.createElement('canvas')
        portraitCanvas.width = portraitImage.width
        portraitCanvas.height = portraitImage.height
        const portraitCtx = portraitCanvas.getContext('2d')
        if (!portraitCtx) {
          throw new Error('Could not get portrait canvas context')
        }
        portraitCtx.drawImage(portraitImage, 0, 0, portraitCanvas.width, portraitCanvas.height)
        portraitTexture = new THREE.CanvasTexture(portraitCanvas)
        portraitTexture.flipY = true
        portraitTexture.needsUpdate = true
        portraitTexture.colorSpace = THREE.SRGBColorSpace
        console.log('[Viewer] Portrait texture created via canvas:', {
          width: portraitCanvas.width,
          height: portraitCanvas.height
        })

        if (!isMounted) {
          portraitTexture.dispose()
          return
        }

        // Create depth texture from ImageData (synchronous)
        const depthCanvas = document.createElement('canvas')
        depthCanvas.width = depthMap.width
        depthCanvas.height = depthMap.height
        const depthCtx = depthCanvas.getContext('2d')
        if (!depthCtx) throw new Error('Could not get depth canvas context')
        depthCtx.putImageData(depthMap, 0, 0)
        depthTexture = new THREE.CanvasTexture(depthCanvas)
        depthTexture.flipY = true
        depthTexture.needsUpdate = true
        depthTexture.colorSpace = THREE.LinearSRGBColorSpace
        console.log('[Viewer] Depth texture created via canvas:', {
          width: depthCanvas.width,
          height: depthCanvas.height
        })

        if (!isMounted) {
          portraitTexture.dispose()
          depthTexture.dispose()
          return
        }

        // Create scene
        console.log('[Viewer] Creating Three.js scene...')
        state = createScene(
          containerRef.current!,
          portraitTexture!,
          depthTexture!,
          {
            portraitWidth: portraitImage.width,
            portraitHeight: portraitImage.height,
            initialSubdivisions: CONFIG.meshSubdivisions
          }
        )
        sceneStateRef.current = state
        if (isMounted) {
          state.renderer.render(state.scene, state.camera)
          setSceneReady(true)
        }
        console.log('[Viewer] ===== Scene initialized successfully =====')
        console.log('[Viewer] Scene state:', {
          hasRenderer: !!state.renderer,
          hasMaterial: !!state.material,
          hasMesh: !!state.mesh,
          containerChildren: containerRef.current!.children.length
        })

      } catch (err) {
        console.error('[Viewer] ===== Scene initialization ERROR =====')
        console.error('[Viewer] Error details:', err)
        console.error('[Viewer] Error stack:', err instanceof Error ? err.stack : 'No stack')
        if (isMounted) {
          const errorMsg = err instanceof Error ? err.message : 'Failed to initialize scene'
          console.error('[Viewer] Setting error state:', errorMsg)
          setError(errorMsg)
        }
      }
    }

    initScene()

    // Cleanup
    return () => {
      console.log('[Viewer] Cleaning up Three.js scene...')
      isMounted = false

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = undefined
      }

      setSceneReady(false)

      if (state) {
        state.dispose()
      } else {
        if (portraitTexture) {
          portraitTexture.dispose()
        }
        if (depthTexture) {
          depthTexture.dispose()
        }
      }

      if (depthRunnerRef.current) {
        depthRunnerRef.current.dispose()
        depthRunnerRef.current = null
      }

      sceneStateRef.current = null
    }
  }, [portraitImage, depthMap])

  // Handle cursor input
  useEffect(() => {
    if (!sceneReady || !containerRef.current || !sceneStateRef.current) return

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
  }, [sceneReady])

  // Animation loop
  useEffect(() => {
    if (!sceneReady || !sceneStateRef.current) {
      return
    }

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
        animationFrameRef.current = undefined
      }
    }
  }, [sceneReady])

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

  // Update yaw/pitch ranges
  useEffect(() => {
    cursorMapperRef.current.setRanges(yawRange, pitchRange)
  }, [yawRange, pitchRange])

  // Update dead zone
  useEffect(() => {
    cursorMapperRef.current.setDeadZone(deadZonePercent)
  }, [deadZonePercent])

  // Handle atlas mode texture updates (when atlas image changes)
  useEffect(() => {
    if (!currentAtlasImageUrl || !sceneStateRef.current || !generatedAtlas) {
      return
    }

    const loadAtlasTexture = async () => {
      try {
        // Create new texture from URL
        const loader = new THREE.TextureLoader()
        const newTexture = await new Promise<THREE.Texture>((resolve, reject) => {
          loader.load(
            currentAtlasImageUrl,
            (texture) => {
              // Configure texture properties
              texture.flipY = true
              texture.colorSpace = THREE.SRGBColorSpace
              texture.needsUpdate = true
              resolve(texture)
            },
            undefined,
            (error) => {
              console.warn(`Failed to load atlas texture: ${error}`)
              reject(error)
            }
          )
        })

        // Dispose old texture if it exists
        if (atlasTextureRef.current) {
          atlasTextureRef.current.dispose()
        }

        // Update scene texture
        atlasTextureRef.current = newTexture
        if (sceneStateRef.current?.material?.uniforms?.portraitMap) {
          sceneStateRef.current.material.uniforms.portraitMap.value = newTexture
          sceneStateRef.current.material.needsUpdate = true
        } else {
          console.warn('Scene state or material uniforms not available for atlas texture update')
        }
      } catch (err) {
        console.warn('Error loading atlas texture:', err)
      }
    }

    loadAtlasTexture()

    return () => {
      // Don't dispose here - texture is reused in next update
    }
  }, [currentAtlasImageUrl, generatedAtlas])

  // Track container dimensions for atlas mode
  useEffect(() => {
    if (!containerRef.current) return

    const updateDimensions = () => {
      if (containerRef.current) {
        setContainerDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        })
      }
    }

    // Initial update
    updateDimensions()

    // Update on window resize
    window.addEventListener('resize', updateDimensions)

    return () => {
      window.removeEventListener('resize', updateDimensions)
    }
  }, [sceneReady])

  // Track cursor position for atlas mode
  useEffect(() => {
    if (!containerRef.current || !generatedAtlas) {
      return
    }

    const handleMouseMove = (event: MouseEvent) => {
      const rect = containerRef.current!.getBoundingClientRect()
      const pos = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      }
      mousePositionRef.current = pos
      setAtlasMousePosition(pos)
    }

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length === 0) return
      const rect = containerRef.current!.getBoundingClientRect()
      const pos = {
        x: event.touches[0].clientX - rect.left,
        y: event.touches[0].clientY - rect.top
      }
      mousePositionRef.current = pos
      setAtlasMousePosition(pos)
    }

    containerRef.current.addEventListener('mousemove', handleMouseMove)
    containerRef.current.addEventListener('touchmove', handleTouchMove)

    return () => {
      containerRef.current?.removeEventListener('mousemove', handleMouseMove)
      containerRef.current?.removeEventListener('touchmove', handleTouchMove)
    }
  }, [generatedAtlas])

  // Memoize atlas config to prevent infinite re-renders
  const atlasConfig = useMemo(
    () => ({
      min: ATLAS_CONFIG.min,
      max: ATLAS_CONFIG.max,
      step: ATLAS_CONFIG.step,
      fallbackImage: ATLAS_CONFIG.fallbackImage
    }),
    [] // ATLAS_CONFIG is constant from config.ts, so dependencies are stable
  )

  // Use atlas mode hook to get current image
  const atlasState = useAtlasMode(
    generatedAtlas || null,
    atlasMousePosition.x,
    atlasMousePosition.y,
    containerDimensions.width,
    containerDimensions.height,
    atlasConfig
  )

  // Update current atlas image URL when atlas state changes
  useEffect(() => {
    if (atlasState.currentImageUrl && atlasState.currentImageUrl !== currentAtlasImageUrl) {
      setCurrentAtlasImageUrl(atlasState.currentImageUrl)
      setCurrentGridCoords(atlasState.gridCoords)
    }
  }, [atlasState])

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

  if (error && !depthMap) {
    // If we have an error but no depth map yet, show error
    // Otherwise, if we have depthMap (from fallback), show viewer
    return (
      <div className="viewer-container">
        <div className="error-overlay">
          <p>Error: {error}</p>
          <p className="error-hint">Using fallback depth map</p>
        </div>
      </div>
    )
  }

  // Show viewer if we have depthMap (either from model or fallback)
  if (depthMap) {
    return (
      <div className="viewer-container">
        {error && (
          <div className="error-banner">
            <p>⚠️ {error}</p>
          </div>
        )}
        <div ref={containerRef} className="viewer-canvas" />
      <Controls
          intensity={intensity}
          smoothing={smoothing}
          showDebug={showDebug}
        yawRange={yawRange}
        pitchRange={pitchRange}
        deadZonePercent={deadZonePercent}
          onIntensityChange={setIntensity}
          onSmoothingChange={setSmoothing}
        onYawRangeChange={setYawRange}
        onPitchRangeChange={setPitchRange}
        onDeadZoneChange={setDeadZonePercent}
          onToggleDebug={() => setShowDebug(!showDebug)}
          onReset={onReset}
          rotation={currentRotation}
          fps={fps}
          // Atlas mode props
          atlasEnabled={!!generatedAtlas}
          atlasGridCoords={currentGridCoords}
          atlasError={atlasError}
          onGenerateAtlas={onGenerateAtlas}
          onResetAtlas={onResetAtlas}
        />
      </div>
    )
  }

  // Should not reach here, but fallback
  return null
}

