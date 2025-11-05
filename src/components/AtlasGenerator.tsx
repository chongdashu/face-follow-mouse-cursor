import { useState } from 'react'
import { generateGazeAtlas } from '../lib/replicate/generateGaze'
import './AtlasGenerator.css'

interface AtlasGeneratorProps {
  portraitImage: HTMLImageElement
  onAtlasGenerated?: (imageMap: Map<string, string>) => void
  onCancel?: () => void
}

/**
 * Component for generating gaze atlas images using Replicate API
 * Shows progress and allows cancellation
 */
export default function AtlasGenerator({ 
  portraitImage, 
  onAtlasGenerated,
  onCancel 
}: AtlasGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState({ completed: 0, total: 121 })
  const [error, setError] = useState<string | null>(null)
  const [generatedImages, setGeneratedImages] = useState<Map<string, string> | null>(null)

  /**
   * Generate atlas with default parameters (11x11 grid, step 3)
   */
  const handleGenerate = async () => {
    setIsGenerating(true)
    setError(null)
    setProgress({ completed: 0, total: 121 })

    try {
      const imageMap = await generateGazeAtlas(
        portraitImage,
        -15, // min
        15,  // max
        3,   // step
        (completed, total) => {
          setProgress({ completed, total })
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
    setProgress({ completed: 0, total: 25 })

    try {
      const imageMap = await generateGazeAtlas(
        portraitImage,
        -12, // min
        12,  // max
        6,   // step (larger step = fewer images)
        (completed, total) => {
          setProgress({ completed, total })
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
    setProgress({ completed: 0, total: 9 })

    try {
      const imageMap = await generateGazeAtlas(
        portraitImage,
        -8,  // min
        8,   // max
        8,   // step (8 degree steps = 3x3 grid: -8, 0, 8)
        (completed, total) => {
          setProgress({ completed, total })
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

      {isGenerating ? (
        <div className="atlas-progress">
          <div className="atlas-progress-bar">
            <div 
              className="atlas-progress-fill"
              style={{ width: `${(progress.completed / progress.total) * 100}%` }}
            />
          </div>
          <p>
            Generating {progress.completed} / {progress.total} images...
          </p>
          <p className="atlas-progress-hint">
            This may take a few minutes. Estimated cost: ~${(progress.total * 0.0001).toFixed(2)}
          </p>
        </div>
      ) : (
        <div className="atlas-actions">
          <button
            className="atlas-button atlas-button-primary"
            onClick={handleGenerate}
          >
            Generate Full Atlas (121 images)
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

