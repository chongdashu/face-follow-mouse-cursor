import { CONFIG } from '../../config'

export interface RotationState {
  yaw: number
  pitch: number
}

/**
 * Maps cursor position to rotation angles with dead-zone, smoothing, and clamps
 */
export class CursorMapper {
  private currentYaw = 0
  private currentPitch = 0
  private smoothingAlpha = CONFIG.emaAlpha

  /**
   * Update smoothing alpha (0-1, mapped from slider 0-100%)
   */
  setSmoothing(smoothingPercent: number): void {
    const min = CONFIG.emaAlphaMin
    const max = CONFIG.emaAlphaMax
    this.smoothingAlpha = min + (smoothingPercent / 100) * (max - min)
  }

  /**
   * Map cursor position to rotation state
   * @param cursorX - Cursor X position relative to container (0 to width)
   * @param cursorY - Cursor Y position relative to container (0 to height)
   * @param containerWidth - Container width
   * @param containerHeight - Container height
   */
  map(
    cursorX: number,
    cursorY: number,
    containerWidth: number,
    containerHeight: number
  ): RotationState {
    // Normalize to [-1, 1] centered
    const normalizedX = (cursorX / containerWidth) * 2 - 1
    const normalizedY = (cursorY / containerHeight) * 2 - 1

    // Calculate distance from center
    const distance = Math.sqrt(normalizedX ** 2 + normalizedY ** 2)

    // Apply dead zone
    const minDimension = Math.min(containerWidth, containerHeight)
    const deadZoneRadius = CONFIG.deadZone * minDimension / Math.min(containerWidth, containerHeight)
    const normalizedDeadZone = CONFIG.deadZone

    if (distance < normalizedDeadZone) {
      // Inside dead zone - maintain current rotation (decay towards center)
      this.currentYaw *= 0.95
      this.currentPitch *= 0.95
      return {
        yaw: this.currentYaw,
        pitch: this.currentPitch
      }
    }

    // Map to target angles
    const targetYaw = normalizedX * CONFIG.yawRange
    const targetPitch = normalizedY * CONFIG.pitchRange

    // Apply EMA smoothing
    this.currentYaw = this.currentYaw * (1 - this.smoothingAlpha) + targetYaw * this.smoothingAlpha
    this.currentPitch = this.currentPitch * (1 - this.smoothingAlpha) + targetPitch * this.smoothingAlpha

    // Clamp
    this.currentYaw = Math.max(-CONFIG.yawRange, Math.min(CONFIG.yawRange, this.currentYaw))
    this.currentPitch = Math.max(-CONFIG.pitchRange, Math.min(CONFIG.pitchRange, this.currentPitch))

    return {
      yaw: this.currentYaw,
      pitch: this.currentPitch
    }
  }

  /**
   * Reset rotation to center
   */
  reset(): void {
    this.currentYaw = 0
    this.currentPitch = 0
  }
}

