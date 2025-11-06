import './Controls.css'

interface ControlsProps {
  intensity: number
  smoothing: number
  showDebug: boolean
  yawRange: number
  pitchRange: number
  deadZonePercent: number
  depthEnabled: boolean
  cursorHidden: boolean
  onIntensityChange: (value: number) => void
  onSmoothingChange: (value: number) => void
  onYawRangeChange: (value: number) => void
  onPitchRangeChange: (value: number) => void
  onDeadZoneChange: (value: number) => void
  onDepthEnabledChange: (enabled: boolean) => void
  onCursorHiddenChange: (hidden: boolean) => void
  onToggleDebug: () => void
  onReset: () => void
  rotation: { yaw: number; pitch: number }
  fps: number
  // Model status
  modelStatus?: 'loading' | 'loaded' | 'fallback' | null
  // Atlas mode props
  atlasEnabled?: boolean
  atlasGridCoords?: { px: number; py: number } | null
  atlasError?: string | null
  atlasCached?: boolean
  onGenerateAtlas?: () => void
  onResetAtlas?: () => void
}

/**
 * UI controls for intensity, smoothing, debug info, and atlas mode
 */
export default function Controls({
  intensity,
  smoothing,
  showDebug,
  yawRange,
  pitchRange,
  deadZonePercent,
  depthEnabled,
  cursorHidden,
  onIntensityChange,
  onSmoothingChange,
  onYawRangeChange,
  onPitchRangeChange,
  onDeadZoneChange,
  onDepthEnabledChange,
  onCursorHiddenChange,
  onToggleDebug,
  onReset,
  rotation,
  fps,
  // Model status
  modelStatus,
  // Atlas mode props
  atlasEnabled,
  atlasGridCoords,
  atlasError,
  atlasCached,
  onGenerateAtlas,
  onResetAtlas
}: ControlsProps) {
  return (
    <div className="controls">
      <div className="controls-panel">
        {/* Model Status Indicator */}
        {modelStatus && (
          <div className="control-group model-status">
            <div className={`model-status-indicator model-status-${modelStatus}`}>
              {modelStatus === 'loading' && (
                <>
                  <span className="model-status-icon">⏳</span>
                  <span className="model-status-text">Loading model...</span>
                </>
              )}
              {modelStatus === 'loaded' && (
                <>
                  <span className="model-status-icon">✅</span>
                  <span className="model-status-text">Model loaded</span>
                </>
              )}
              {modelStatus === 'fallback' && (
                <>
                  <span className="model-status-icon">⚠️</span>
                  <span className="model-status-text">Using fallback depth</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Depth Effect Master Toggle */}
        <div className="control-group depth-toggle">
          <label htmlFor="depthToggle">
            <input
              id="depthToggle"
              type="checkbox"
              checked={depthEnabled}
              onChange={(e) => onDepthEnabledChange(e.target.checked)}
            />
            Enable Depth Effect
          </label>
        </div>

        {/* Cursor Visibility Toggle */}
        <div className="control-group cursor-toggle">
          <label htmlFor="cursorToggle">
            <input
              id="cursorToggle"
              type="checkbox"
              checked={!cursorHidden}
              onChange={(e) => onCursorHiddenChange(!e.target.checked)}
            />
            Show Cursor
          </label>
        </div>

        {/* Depth Effect Sliders (only visible when depth is enabled) */}
        {depthEnabled && (
          <>
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
              <label htmlFor="yawRange">
                Yaw range: {yawRange.toFixed(0)}°
              </label>
              <input
                id="yawRange"
                type="range"
                min="0"
                max="30"
                value={yawRange}
                onChange={(e) => onYawRangeChange(Number(e.target.value))}
              />
            </div>

            <div className="control-group">
              <label htmlFor="pitchRange">
                Pitch range: {pitchRange.toFixed(0)}°
              </label>
              <input
                id="pitchRange"
                type="range"
                min="0"
                max="20"
                value={pitchRange}
                onChange={(e) => onPitchRangeChange(Number(e.target.value))}
              />
            </div>

            <div className="control-group">
              <label htmlFor="deadZone">
                Dead zone: {deadZonePercent.toFixed(0)}%
              </label>
              <input
                id="deadZone"
                type="range"
                min="0"
                max="20"
                value={deadZonePercent}
                onChange={(e) => onDeadZoneChange(Number(e.target.value))}
              />
            </div>
          </>
        )}

        <div className="control-group">
          <button onClick={onToggleDebug} className={showDebug ? 'active' : ''}>
            {showDebug ? 'Hide' : 'Show'} Debug
          </button>
          <button onClick={onReset}>Reset</button>
        </div>

        {/* Atlas mode controls */}
        <div className="control-group atlas-controls">
          {!atlasEnabled && onGenerateAtlas && (
            <button onClick={onGenerateAtlas} className="atlas-generate-btn">
              Generate Atlas
            </button>
          )}

          {atlasEnabled && (
            <div className="atlas-status">
              <div className="atlas-status-info">
                <span className="atlas-status-label">
                  Atlas Active
                  {atlasCached && <span className="atlas-cached-badge" title="Atlas loaded from cache">📦 Cached</span>}
                </span>
                {atlasGridCoords && (
                  <span className="atlas-grid-coords">
                    px: {atlasGridCoords.px}, py: {atlasGridCoords.py}
                  </span>
                )}
              </div>
              {onResetAtlas && (
                <button onClick={onResetAtlas} className="atlas-reset-btn">
                  Clear Atlas
                </button>
              )}
            </div>
          )}

          {atlasError && (
            <div className="atlas-error">
              ⚠️ {atlasError}
            </div>
          )}
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

