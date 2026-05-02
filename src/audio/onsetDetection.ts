const MIN_INTER_ONSET_MS = 70

export type OnsetDetectorOptions = {
  /** Multiplier over estimated noise floor to count as onset */
  sensitivity: number
}

const defaultOptions: OnsetDetectorOptions = {
  sensitivity: 4,
}

/**
 * Simple amplitude onset detector (main-thread RMS).
 * Call `process` each frame with peak RMS for the current buffer.
 */
export class OnsetDetector {
  private lastTriggerMs = 0
  private noiseFloor = 0.001
  private readonly opts: OnsetDetectorOptions

  constructor(opts: Partial<OnsetDetectorOptions> = {}) {
    this.opts = { ...defaultOptions, ...opts }
  }

  /** Adapt noise floor from quiet frames (call when level is below threshold). */
  updateNoiseFloor(rms: number, alpha = 0.05) {
    this.noiseFloor = this.noiseFloor * (1 - alpha) + rms * alpha
  }

  /**
   * @param rms 0..1 typical range from float time-domain RMS
   * @param nowMs monotonic clock (performance.now)
   * @returns true if a new onset was detected this frame
   */
  process(rms: number, nowMs: number): boolean {
    const threshold = Math.max(
      0.02,
      this.noiseFloor * this.opts.sensitivity,
    )
    if (rms < threshold) {
      this.updateNoiseFloor(rms)
      return false
    }
    if (nowMs - this.lastTriggerMs < MIN_INTER_ONSET_MS) {
      return false
    }
    this.lastTriggerMs = nowMs
    return true
  }

  reset() {
    this.lastTriggerMs = 0
  }
}

export function rmsFromFloat32Channel(data: Float32Array): number {
  if (data.length === 0) return 0
  let sum = 0
  for (let i = 0; i < data.length; i++) {
    const s = data[i] ?? 0
    sum += s * s
  }
  return Math.sqrt(sum / data.length)
}
