import { useState } from 'react'
import Upload from './components/Upload'
import Viewer from './components/Viewer'
import AtlasGenerator from './components/AtlasGenerator'
import './App.css'

/**
 * Main app component that handles the upload → viewer flow
 * Supports both depth-based parallax and optional atlas mode
 */
function App() {
  const [portraitImage, setPortraitImage] = useState<HTMLImageElement | null>(null)
  const [depthMap, setDepthMap] = useState<ImageData | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Atlas mode state
  const [generatedAtlas, setGeneratedAtlas] = useState<Map<string, string> | null>(null)
  const [showAtlasGenerator, setShowAtlasGenerator] = useState(false)
  const [atlasError, setAtlasError] = useState<string | null>(null)

  const handleImageUpload = async (image: HTMLImageElement) => {
    setPortraitImage(image)
    setIsProcessing(true)
    setDepthMap(null)
    setGeneratedAtlas(null) // Reset atlas when new image uploaded
    setAtlasError(null)

    // Depth processing will be handled by Viewer component
  }

  const handleDepthReady = (depth: ImageData) => {
    setDepthMap(depth)
    setIsProcessing(false)
  }

  const handleGenerateAtlas = () => {
    setShowAtlasGenerator(true)
    setAtlasError(null)
  }

  const handleAtlasGenerated = (imageMap: Map<string, string>) => {
    setGeneratedAtlas(imageMap)
    setShowAtlasGenerator(false)
    setAtlasError(null)
  }

  const handleCancelGeneration = () => {
    setShowAtlasGenerator(false)
  }

  const handleResetAtlas = () => {
    setGeneratedAtlas(null)
    setAtlasError(null)
  }

  // Show viewer when both portrait and depth are ready
  if (portraitImage && depthMap) {
    return (
      <div className="app">
        <Viewer
          portraitImage={portraitImage}
          depthMap={depthMap}
          generatedAtlas={generatedAtlas}
          atlasError={atlasError}
          onGenerateAtlas={handleGenerateAtlas}
          onResetAtlas={handleResetAtlas}
          onReset={() => {
            setPortraitImage(null)
            setDepthMap(null)
            setGeneratedAtlas(null)
            setShowAtlasGenerator(false)
            setAtlasError(null)
            setIsProcessing(false)
          }}
        />

        {/* Show generator modal when triggered */}
        {showAtlasGenerator && portraitImage && (
          <div className="atlas-generator-overlay">
            <div className="atlas-generator-container">
              <AtlasGenerator
                portraitImage={portraitImage}
                onAtlasGenerated={handleAtlasGenerated}
                onCancel={handleCancelGeneration}
              />
            </div>
          </div>
        )}
      </div>
    )
  }

  // Show upload and processing
  return (
    <div className="app">
      {/* Show Viewer in background when processing */}
      {isProcessing && portraitImage && (
        <Viewer
          portraitImage={portraitImage}
          depthMap={null}
          onDepthReady={handleDepthReady}
          onReset={() => {
            setPortraitImage(null)
            setDepthMap(null)
            setGeneratedAtlas(null)
            setShowAtlasGenerator(false)
            setAtlasError(null)
            setIsProcessing(false)
          }}
        />
      )}

      {/* Overlay Upload component when processing */}
      <div className={isProcessing && portraitImage ? 'upload-overlay' : ''}>
        <Upload onImageUpload={handleImageUpload} />
      </div>

      {/* Show generator modal when triggered */}
      {showAtlasGenerator && portraitImage && (
        <div className="atlas-generator-overlay">
          <div className="atlas-generator-container">
            <AtlasGenerator
              portraitImage={portraitImage}
              onAtlasGenerated={handleAtlasGenerated}
              onCancel={handleCancelGeneration}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default App

