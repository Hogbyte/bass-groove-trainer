/** Snapshot shown when the user ends a practice session. */
export type SessionSummary = {
  durationSec: number
  /** Quarter-note pulses elapsed during the session (metronome grid). */
  totalBeats: number
  /** Detected note onsets. */
  totalHits: number
  perfect: number
  good: number
  off: number
  /** Expected beats with no onset attributed to that beat. */
  missedBeats: number
  /** Mean |offset| in ms across hits (0 if no hits). */
  meanAbsOffsetMs: number
  /** Share of hits that were perfect or good (0–100), or null if no hits. */
  onTimePercent: number | null
}
