import { useEffect, useRef, useState, useMemo } from 'react'
import * as THREE from 'three'
import { OnnxDepthRunner } from '../lib/depth/onnxRunner'
import { createScene, updateMeshSubdivisions } from '../lib/three/createScene'
import { CursorMapper } from '../lib/cursor/mapInput'
import { useAtlasMode } from '../lib/atlas/useAtlasMode'
import { CONFIG, ATLAS_CONFIG } from '../config'
import Controls from './Controls'
import AtlasPreview from './AtlasPreview'
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
  const atlasThrottleRef = useRef({ lastUpdateTime: 0 })

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
  const [depthEnabled, setDepthEnabled] = useState(true)
  const [cursorHidden, setCursorHidden] = useState(false)

  // Atlas mode state
  const [currentAtlasImageUrl, setCurrentAtlasImageUrl] = useState<string | null>(null)
  const [currentGridCoords, setCurrentGridCoords] = useState<{ px: number; py: number } | null>(null)
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 })
  const [atlasMousePosition, setAtlasMousePosition] = useState({ x: 0, y: 0 })

  // Detect atlas config from generated atlas keys
  const atlasConfig = useMemo(() => {
    if (!generatedAtlas || generatedAtlas.size === 0) {
      return ATLAS_CONFIG
    }

    // Extract the first key to detect the grid parameters
    const firstKey = Array.from(generatedAtlas.keys())[0]

    // Parse key format: px{number}_py{number}
    const match = firstKey.match(/px(-?\d+)_py(-?\d+)/)
    if (!match) {
      console.warn('[ATLAS] Could not parse key format, using default config')
      return ATLAS_CONFIG
    }

    const values = Array.from(generatedAtlas.keys())
      .map(key => {
        const m = key.match(/px(-?\d+)_py(-?\d+)/)
        return m ? [parseInt(m[1]), parseInt(m[2])] : null
      })
      .filter(v => v !== null) as number[][]

    if (values.length === 0) {
      return ATLAS_CONFIG
    }

    // Get unique px and py values
    const pxValues = [...new Set(values.map(v => v[0]))].sort((a, b) => a - b)
    const pyValues = [...new Set(values.map(v => v[1]))].sort((a, b) => a - b)

    // Calculate step size
    const pxStep = pxValues.length > 1 ? pxValues[1] - pxValues[0] : 1
    const pyStep = pyValues.length > 1 ? pyValues[1] - pyValues[0] : 1
    const step = Math.max(pxStep, pyStep)

    const min = Math.min(...pxValues, ...pyValues)
    const max = Math.max(...pxValues, ...pyValues)

    const detectedConfig = { ...ATLAS_CONFIG, min, max, step }
    return detectedConfig
  }, [generatedAtlas])

  // Use atlas mode hook to get current image
  const atlasState = useAtlasMode(
    generatedAtlas || null,
    atlasMousePosition.x,
    atlasMousePosition.y,
    containerDimensions.width,
    containerDimensions.height,
    atlasConfig
  )

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

  // Initialize depth inference if needed
  useEffect(() => {
    if (depthMap || !portraitImage) {
      return
    }

    let isCancelled = false

    const runDepthInference = async () => {
      try {
        setIsProcessing(true)
        setError(null)

        // Check if we should skip model loading (for testing)
        if (CONFIG.useFallbackOnly) {
          throw new Error('Using fallback depth map (debug mode)')
        }

        const modelPath = '/models/depth-anything-v2-small.onnx'

        // First, check if model file exists
        try {
          const response = await fetch(modelPath, { method: 'HEAD' })
          if (!response.ok) {
            throw new Error(`Model file not found at ${modelPath}. Using fallback depth map.`)
          }
        } catch (fetchError) {
          throw new Error('Model file not found. Using fallback depth map.')
        }

        // Check if effect was cancelled before proceeding
        if (isCancelled) return

        // Dispose existing runner if it exists
        if (depthRunnerRef.current) {
          await depthRunnerRef.current.dispose()
          depthRunnerRef.current = null
        }

        const runner = new OnnxDepthRunner()
        await runner.initialize(modelPath)

        // Check again after async operation
        if (isCancelled) {
          await runner.dispose()
          return
        }

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

        // Final cancellation check before updating state
        if (isCancelled) {
          await runner.dispose()
          return
        }

        depthRunnerRef.current = runner
        if (onDepthReady) {
          onDepthReady(result.imageData)
        }
      } catch (err) {
        if (isCancelled) return

        console.warn('Depth inference failed, using fallback:', err)
        const errorMessage = err instanceof Error ? err.message : 'Failed to generate depth map'
        setError(errorMessage)

        // Always provide fallback depth map
        try {
          const fallbackDepth = createFallbackDepth(portraitImage.width, portraitImage.height)
          if (onDepthReady && !isCancelled) {
            onDepthReady(fallbackDepth)
          }
        } catch (fallbackError) {
          console.error('Failed to create fallback depth map:', fallbackError)
          if (!isCancelled) {
            setError('Failed to process image. Please try again.')
          }
        }
      } finally {
        if (!isCancelled) {
          setIsProcessing(false)
        }
      }
    }

    runDepthInference()

    // Cleanup function to cancel in-flight operations
    return () => {
      isCancelled = true
    }
  }, [portraitImage, depthMap, onDepthReady])

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current || !portraitImage || !depthMap) {
      return
    }

    let state: ReturnType<typeof createScene> | null = null
    let portraitTexture: THREE.Texture | null = null
    let depthTexture: THREE.Texture | null = null
    let isMounted = true

    const initScene = async () => {
      try {
        // Ensure image is loaded
        if (!portraitImage.complete || portraitImage.naturalWidth === 0) {
          await new Promise<void>((resolve, reject) => {
            const img = portraitImage!
            if (img.complete) {
              resolve()
            } else {
              img.onload = () => resolve()
              img.onerror = () => reject(new Error('Failed to load portrait image'))
            }
          })
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

        if (!isMounted) {
          portraitTexture.dispose()
          depthTexture.dispose()
          return
        }

        // Create scene
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

      } catch (err) {
        console.error('Scene initialization error:', err)
        if (isMounted) {
          const errorMsg = err instanceof Error ? err.message : 'Failed to initialize scene'
          setError(errorMsg)
        }
      }
    }

    initScene()

    // Cleanup
    return () => {
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

      // Note: cleanup function cannot be async, but dispose is async
      // This is acceptable as it's cleanup - just fire and forget
      if (depthRunnerRef.current) {
        depthRunnerRef.current.dispose().catch(err =>
          console.warn('Error during cleanup dispose:', err)
        )
        depthRunnerRef.current = null
      }

      sceneStateRef.current = null
    }
  }, [portraitImage, depthMap])

  // Handle cursor input for both depth parallax and atlas mode
  useEffect(() => {
    if (!sceneReady || !containerRef.current || !sceneStateRef.current) return

    const container = containerRef.current

    const handleMove = (e: MouseEvent | TouchEvent) => {
      // Get fresh references on each event to avoid stale closures
      if (!sceneStateRef.current) return
      const material = sceneStateRef.current.material

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

      // Always update mousePositionRef for depth parallax
      mousePositionRef.current = { x, y }

      // Update depth parallax uniforms
      const rotation = cursorMapperRef.current.map(
        x,
        y,
        rect.width,
        rect.height
      )

      // Apply rotation - always set the values
      material.uniforms.yaw.value = rotation.yaw
      material.uniforms.pitch.value = rotation.pitch

      // Signal Three.js to apply the uniform changes
      material.uniformsNeedUpdate = true

      setCurrentRotation(rotation)

      // Update atlas coordinates if atlas mode is active
      if (generatedAtlas) {
        const now = performance.now()
        if (now - atlasThrottleRef.current.lastUpdateTime >= 33) { // ~30fps throttle
          setAtlasMousePosition({ x, y })
          atlasThrottleRef.current.lastUpdateTime = now
        }
      }
    }

    container.addEventListener('mousemove', handleMove)
    container.addEventListener('touchmove', handleMove, { passive: false })

    return () => {
      container.removeEventListener('mousemove', handleMove)
      container.removeEventListener('touchmove', handleMove)
    }
  }, [sceneReady, generatedAtlas])

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

  // Update intensity (depth scale) and depth enabled
  useEffect(() => {
    if (!sceneStateRef.current) return
    // If depth is disabled, set scale to 0, otherwise use intensity value
    const scale = depthEnabled
      ? (intensity / 100) * (CONFIG.depthScaleMax - CONFIG.depthScaleMin) + CONFIG.depthScaleMin
      : 0
    sceneStateRef.current.material.uniforms.depthScale.value = scale
  }, [intensity, depthEnabled])

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

  // Handler for previewing atlas images on hover
  const handleAtlasImagePreview = (imageUrl: string) => {
    if (!sceneStateRef.current || !generatedAtlas) {
      return
    }

    const loadAtlasTexture = async () => {
      try {
        const loader = new THREE.TextureLoader()
        const newTexture = await new Promise<THREE.Texture>((resolve, reject) => {
          loader.load(
            imageUrl,
            (texture) => {
              texture.flipY = true
              texture.colorSpace = THREE.SRGBColorSpace
              texture.needsUpdate = true
              resolve(texture)
            },
            undefined,
            (error) => {
              console.warn(`Failed to load preview texture: ${error}`)
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
        if (sceneStateRef.current?.material?.uniforms?.map) {
          sceneStateRef.current.material.uniforms.map.value = newTexture
          sceneStateRef.current.material.uniformsNeedUpdate = true
        }
      } catch (err) {
        console.warn('Error loading preview texture:', err)
      }
    }

    loadAtlasTexture()
  }

  // Handle atlas mode texture updates (when atlas image changes)
  useEffect(() => {
    if (!atlasState.currentImageUrl || !sceneStateRef.current || !generatedAtlas) {
      return
    }

    // Capture the URL to avoid TypeScript null check issues in async function
    const imageUrl = atlasState.currentImageUrl

    const loadAtlasTexture = async () => {
      try {
        // Create new texture from URL
        const loader = new THREE.TextureLoader()
        const newTexture = await new Promise<THREE.Texture>((resolve, reject) => {
          loader.load(
            imageUrl,
            (texture) => {
              // Configure texture properties
              texture.flipY = true
              texture.colorSpace = THREE.SRGBColorSpace
              texture.needsUpdate = true
              resolve(texture)
            },
            undefined,
            (error) => {
              console.warn(`[ATLAS] Failed to load atlas texture: ${error}`)
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
        if (sceneStateRef.current?.material?.uniforms?.map) {
          sceneStateRef.current.material.uniforms.map.value = newTexture
          sceneStateRef.current.material.uniformsNeedUpdate = true
        } else {
          console.warn('[ATLAS] Material or uniforms not found')
        }
      } catch (err) {
        console.warn('[ATLAS] Error loading atlas texture:', err)
      }
    }

    loadAtlasTexture()

    return () => {
      // Don't dispose here - texture is reused in next update
    }
  }, [atlasState, generatedAtlas])

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

    // Debounced window resize
    let resizeTimeout: NodeJS.Timeout | null = null
    const handleWindowResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(updateDimensions, 100)
    }

    window.addEventListener('resize', handleWindowResize)

    // ResizeObserver for container changes
    const resizeObserver = new ResizeObserver(() => {
      if (resizeTimeout) clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(updateDimensions, 100)
    })

    resizeObserver.observe(containerRef.current)

    return () => {
      window.removeEventListener('resize', handleWindowResize)
      resizeObserver.disconnect()
      if (resizeTimeout) clearTimeout(resizeTimeout)
    }
  }, []) // Empty dependency - attach once on mount and never re-attach

  // Update current atlas image URL and grid coordinates when atlas state changes
  useEffect(() => {
    if (!generatedAtlas) return

    // Always update grid coordinates so they follow cursor
    setCurrentGridCoords(atlasState.gridCoords)

    // Update canvas image if URL changed
    if (atlasState.currentImageUrl && atlasState.currentImageUrl !== currentAtlasImageUrl) {
      setCurrentAtlasImageUrl(atlasState.currentImageUrl)
    }
  }, [atlasState, generatedAtlas, currentAtlasImageUrl])

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
        <div ref={containerRef} className={`viewer-canvas ${cursorHidden ? 'cursor-hidden' : ''}`} />
      <Controls
          intensity={intensity}
          smoothing={smoothing}
          showDebug={showDebug}
        yawRange={yawRange}
        pitchRange={pitchRange}
        deadZonePercent={deadZonePercent}
        depthEnabled={depthEnabled}
        cursorHidden={cursorHidden}
          onIntensityChange={setIntensity}
          onSmoothingChange={setSmoothing}
        onYawRangeChange={setYawRange}
        onPitchRangeChange={setPitchRange}
        onDeadZoneChange={setDeadZonePercent}
        onDepthEnabledChange={setDepthEnabled}
        onCursorHiddenChange={setCursorHidden}
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
        <AtlasPreview generatedAtlas={generatedAtlas} onImageHover={handleAtlasImagePreview} />
      </div>
    )
  }

  // Should not reach here, but fallback
  return null
}

