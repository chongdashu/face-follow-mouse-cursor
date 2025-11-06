import { useState } from 'react'
import './AtlasPreview.css'

interface AtlasPreviewProps {
  generatedAtlas: Map<string, string> | null | undefined
  onImageHover?: (imageUrl: string) => void
}

/**
 * Display a drawer with grid of all generated atlas images
 * Hover over items to preview them on the main canvas
 */
export default function AtlasPreview({ generatedAtlas, onImageHover }: AtlasPreviewProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!generatedAtlas || generatedAtlas.size === 0) {
    return null
  }

  // Convert map to sorted array for consistent grid display
  const images = Array.from(generatedAtlas.entries())
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))

  return (
    <>
      {/* Toggle button */}
      <button
        className="atlas-preview-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Toggle atlas preview drawer"
      >
        📸 Atlas ({images.length})
      </button>

      {/* Drawer */}
      {isOpen && (
        <div className="atlas-preview-drawer">
          <div className="atlas-preview-header">
            <h3>Generated Atlas Images ({images.length})</h3>
            <button
              className="atlas-preview-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close drawer"
            >
              ✕
            </button>
          </div>
          <p className="atlas-preview-subtitle">Hover images to preview on canvas</p>
          <div className="atlas-preview-grid">
            {images.map(([key, imageUrl]) => (
              <div
                key={key}
                className="atlas-preview-item"
                onMouseEnter={() => onImageHover?.(imageUrl)}
                title={`Hover to preview: ${key}`}
              >
                <img
                  src={imageUrl}
                  alt={`Atlas ${key}`}
                  loading="lazy"
                />
                <div className="atlas-preview-label">{key}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
