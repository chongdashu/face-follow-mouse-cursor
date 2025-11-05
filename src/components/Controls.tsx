import './Controls.css'

interface ControlsProps {
  intensity: number
  smoothing: number
  showDebug: boolean
  onIntensityChange: (value: number) => void
  onSmoothingChange: (value: number) => void
  onToggleDebug: () => void
  onReset: () => void
  rotation: { yaw: number; pitch: number }
  fps: number
}

/**
 * UI controls for intensity, smoothing, and debug info
 */
export default function Controls({
  intensity,
  smoothing,
  showDebug,
  onIntensityChange,
  onSmoothingChange,
  onToggleDebug,
  onReset,
  rotation,
  fps
}: ControlsProps) {
  return (
    <div className="controls">
      <div className="controls-panel">
        <div className="control-group">
          <label htmlFor="intensity">
            Intensity: {intensity}%
          </label>
          <input
            id="intensity"
            type="range"
            min="0"
            max="100"
            value={intensity}
            onChange={(e) => onIntensityChange(Number(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label htmlFor="smoothing">
            Smoothing: {smoothing}%
          </label>
          <input
            id="smoothing"
            type="range"
            min="0"
            max="100"
            value={smoothing}
            onChange={(e) => onSmoothingChange(Number(e.target.value))}
          />
        </div>

        <div className="control-group">
          <button onClick={onToggleDebug} className={showDebug ? 'active' : ''}>
            {showDebug ? 'Hide' : 'Show'} Debug
          </button>
          <button onClick={onReset}>Reset</button>
        </div>
      </div>

      {showDebug && (
        <div className="debug-panel">
          <div className="debug-item">
            <span className="debug-label">Yaw:</span>
            <span className="debug-value">{rotation.yaw.toFixed(2)}°</span>
          </div>
          <div className="debug-item">
            <span className="debug-label">Pitch:</span>
            <span className="debug-value">{rotation.pitch.toFixed(2)}°</span>
          </div>
          <div className="debug-item">
            <span className="debug-label">FPS:</span>
            <span className="debug-value">{fps}</span>
          </div>
        </div>
      )}
    </div>
  )
}

