import { useState, useEffect } from 'react'
import { generateGazeAtlas, checkAtlasCache } from '../lib/replicate/generateGaze'
import './AtlasGenerator.css'

interface AtlasGeneratorProps {
  portraitImage: HTMLImageElement
  onAtlasGenerated?: (imageMap: Map<string, string>) => void
  onCancel?: () => void
}

/**
 * Component for generating gaze atlas images using Replicate API
 * Shows progress, cache status, and allows cancellation
 */
export default function AtlasGenerator({
  portraitImage,
  onAtlasGenerated,
  onCancel
}: AtlasGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState({ completed: 0, total: 121, cached: 0 })
  const [error, setError] = useState<string | null>(null)
  const [generatedImages, setGeneratedImages] = useState<Map<string, string> | null>(null)
  const [cacheStatus, setCacheStatus] = useState<{ total: number; cached: number } | null>(null)
  const [isCheckingCache, setIsCheckingCache] = useState(false)

  /**
   * Check cache status on mount for all atlas sizes
   */
  useEffect(() => {
    const checkCache = async () => {
      setIsCheckingCache(true)
      try {
        // Check cache for default 11x11 atlas
        const status = await checkAtlasCache(portraitImage, -15, 15, 3)
        setCacheStatus(status)
        console.log('[ATLAS-GEN] Cache status:', status)
      } catch (error) {
        console.warn('[ATLAS-GEN] Failed to check cache:', error)
      } finally {
        setIsCheckingCache(false)
      }
    }
    checkCache()
  }, [portraitImage])

  /**
   * Generate atlas with default parameters (11x11 grid, step 3)
   */
  const handleGenerate = async () => {
    setIsGenerating(true)
    setError(null)
    setProgress({ completed: 0, total: 121, cached: 0 })

    try {
      const imageMap = await generateGazeAtlas(
        portraitImage,
        -15, // min
        15,  // max
        3,   // step
        (completed, total, cached) => {
          setProgress({ completed, total, cached })
        }
      )

      setGeneratedImages(imageMap)
      setIsGenerating(false)
      onAtlasGenerated?.(imageMap)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate atlas')
      setIsGenerating(false)
    }
  }

  /**
   * Generate a smaller test set (5x5 grid) for quick testing
   */
  const handleTestGenerate = async () => {
    setIsGenerating(true)
    setError(null)
    setProgress({ completed: 0, total: 25, cached: 0 })

    try {
      const imageMap = await generateGazeAtlas(
        portraitImage,
        -12, // min
        12,  // max
        6,   // step (larger step = fewer images)
        (completed, total, cached) => {
          setProgress({ completed, total, cached })
        }
      )

      setGeneratedImages(imageMap)
      setIsGenerating(false)
      onAtlasGenerated?.(imageMap)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate test atlas')
      setIsGenerating(false)
    }
  }

  /**
   * Generate ultra-minimal test set (3x3 grid, 9 images) for ultra-fast testing
   */
  const handleUltraTestGenerate = async () => {
    setIsGenerating(true)
    setError(null)
    setProgress({ completed: 0, total: 9, cached: 0 })

    try {
      const imageMap = await generateGazeAtlas(
        portraitImage,
        -8,  // min
        8,   // max
        8,   // step (8 degree steps = 3x3 grid: -8, 0, 8)
        (completed, total, cached) => {
          setProgress({ completed, total, cached })
        }
      )

      setGeneratedImages(imageMap)
      setIsGenerating(false)
      onAtlasGenerated?.(imageMap)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate ultra test atlas')
      setIsGenerating(false)
    }
  }

  if (generatedImages) {
    return (
      <div className="atlas-generator">
        <div className="atlas-success">
          <h2>✅ Atlas Generated Successfully!</h2>
          <p>Generated {generatedImages.size} images</p>
          <p className="atlas-hint">
            Images are now available for use in atlas mode.
            They will be downloaded and cached in your browser.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="atlas-generator">
      <div className="atlas-generator-header">
        <h2>Generate Gaze Atlas</h2>
        <p>Generate a grid of gaze images using Replicate API</p>
      </div>

      {error && (
        <div className="atlas-error">
          <p>❌ Error: {error}</p>
          <p className="atlas-error-hint">
            Make sure REPLICATE_API_TOKEN is set in your Vercel environment variables.
          </p>
        </div>
      )}

      {isCheckingCache && (
        <div className="atlas-cache-check">
          <p>Checking cache...</p>
        </div>
      )}

      {cacheStatus && !isGenerating && (
        <div className="atlas-cache-status">
          {cacheStatus.cached > 0 ? (
            <>
              <p className="cache-hit">
                ✅ {cacheStatus.cached}/{cacheStatus.total} images already cached
              </p>
              <p className="cache-hint">
                Cached images will load instantly. Only {cacheStatus.total - cacheStatus.cached} new images need generation.
              </p>
            </>
          ) : (
            <p className="cache-miss">
              No cached images found. All {cacheStatus.total} images will be generated.
            </p>
          )}
        </div>
      )}

      {isGenerating ? (
        <div className="atlas-progress">
          <div className="atlas-progress-bar">
            <div
              className="atlas-progress-fill"
              style={{ width: `${(progress.completed / progress.total) * 100}%` }}
            />
          </div>
          <p>
            {progress.cached > 0 ? (
              <>
                Processing {progress.completed} / {progress.total} images
                ({progress.cached} from cache)
              </>
            ) : (
              <>Generating {progress.completed} / {progress.total} images...</>
            )}
          </p>
          <p className="atlas-progress-hint">
            This may take a few minutes. Estimated cost: ~${((progress.total - progress.cached) * 0.0001).toFixed(4)}
          </p>
        </div>
      ) : (
        <div className="atlas-actions">
          <button
            className="atlas-button atlas-button-primary"
            onClick={handleGenerate}
          >
            Generate Full Atlas (121 images)
            {cacheStatus && cacheStatus.cached > 0 && (
              <span className="button-badge"> {cacheStatus.cached} cached</span>
            )}
          </button>
          <button
            className="atlas-button atlas-button-secondary"
            onClick={handleTestGenerate}
          >
            Test Generation (25 images)
          </button>
          <button
            className="atlas-button atlas-button-secondary"
            onClick={handleUltraTestGenerate}
          >
            Ultra Test (9 images)
          </button>
          {onCancel && (
            <button
              className="atlas-button atlas-button-cancel"
              onClick={onCancel}
            >
              Cancel
            </button>
          )}
        </div>
      )}

      <div className="atlas-info">
        <h3>What happens:</h3>
        <ul>
          <li>Your image is sent to Replicate API via secure serverless function</li>
          <li>121 images are generated (11×11 grid, ±15° range, step 3°)</li>
          <li>Images are generated sequentially (takes ~2-5 minutes)</li>
          <li>Estimated cost: ~$0.01-0.02</li>
          <li>Images are cached for use in atlas mode</li>
        </ul>
      </div>
    </div>
  )
}

