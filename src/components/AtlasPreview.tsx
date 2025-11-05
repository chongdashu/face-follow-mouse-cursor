import './AtlasPreview.css'

interface AtlasPreviewProps {
  generatedAtlas: Map<string, string> | null | undefined
}

/**
 * Display a grid of all generated atlas images
 */
export default function AtlasPreview({ generatedAtlas }: AtlasPreviewProps) {
  if (!generatedAtlas || generatedAtlas.size === 0) {
    return null
  }

  // Convert map to sorted array for consistent grid display
  const images = Array.from(generatedAtlas.entries())
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))

  return (
    <div className="atlas-preview">
      <div className="atlas-preview-header">
        <h3>Generated Atlas Images ({images.length})</h3>
        <p className="atlas-preview-subtitle">Hover to see coordinates</p>
      </div>
      <div className="atlas-preview-grid">
        {images.map(([key, imageUrl]) => (
          <div key={key} className="atlas-preview-item">
            <img
              src={imageUrl}
              alt={`Atlas ${key}`}
              title={key}
              loading="lazy"
            />
            <div className="atlas-preview-label">{key}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
