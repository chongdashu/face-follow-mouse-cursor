/**
 * Stub component for atlas-based viewer (not implemented in MVP)
 * This would render an <img> tag that swaps src based on cursor position
 */

interface AtlasViewerProps {
  basePath: string
  onReset: () => void
}

export default function AtlasViewer({ onReset }: AtlasViewerProps) {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Atlas Mode (Not Implemented)</h2>
      <p>This would use pre-generated image grids instead of depth-based parallax.</p>
      <p>See RESEARCH.md for details on the atlas approach.</p>
      <button onClick={onReset}>Back</button>
    </div>
  )
}

