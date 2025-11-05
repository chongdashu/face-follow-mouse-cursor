import { useState } from 'react'
import Upload from './components/Upload'
import Viewer from './components/Viewer'
import AtlasViewer from './components/AtlasViewer'
import './App.css'

/**
 * Main app component that handles the upload → viewer flow
 */
function App() {
  const [portraitImage, setPortraitImage] = useState<HTMLImageElement | null>(null)
  const [depthMap, setDepthMap] = useState<ImageData | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [mode, setMode] = useState<'depth' | 'atlas'>('depth')

  const handleImageUpload = async (image: HTMLImageElement) => {
    setPortraitImage(image)
    setIsProcessing(true)
    setDepthMap(null)
    
    // Depth processing will be handled by Viewer component
    // or we can do it here and pass the result
  }

  const handleDepthReady = (depth: ImageData) => {
    setDepthMap(depth)
    setIsProcessing(false)
  }

  if (portraitImage && depthMap && mode === 'depth') {
    return (
      <Viewer
        portraitImage={portraitImage}
        depthMap={depthMap}
        onReset={() => {
          setPortraitImage(null)
          setDepthMap(null)
          setIsProcessing(false)
        }}
      />
    )
  }

  if (mode === 'atlas') {
    return (
      <AtlasViewer
        basePath="/faces/"
        onReset={() => setMode('depth')}
      />
    )
  }

  return (
    <div className="app">
      <Upload onImageUpload={handleImageUpload} />
      {isProcessing && portraitImage && (
        <Viewer
          portraitImage={portraitImage}
          depthMap={null}
          onDepthReady={handleDepthReady}
          onReset={() => {
            setPortraitImage(null)
            setDepthMap(null)
            setIsProcessing(false)
          }}
        />
      )}
    </div>
  )
}

export default App

