/** Quarter-note index `k` aligned with `nearestBeatOffsetMs` (nearest grid). */
export function nearestQuarterBeatIndex(
  transportSeconds: number,
  bpm: number,
): number {
  const beatDur = 60 / bpm
  return Math.round(transportSeconds / beatDur)
}

/** Signed ms: negative = early, positive = late vs nearest quarter-note grid. */
export function nearestBeatOffsetMs(
  transportSeconds: number,
  bpm: number,
): number {
  const beatDur = 60 / bpm
  const k = Math.round(transportSeconds / beatDur)
  const nearestBeatTime = k * beatDur
  return (transportSeconds - nearestBeatTime) * 1000
}

export type TimingBand = 'perfect' | 'good' | 'off'

export function classifyTiming(offsetMs: number): TimingBand {
  const a = Math.abs(offsetMs)
  if (a <= 15) return 'perfect'
  if (a <= 30) return 'good'
  return 'off'
}

/** Rolling signed offsets for last `maxBeats` hits (default 16 = 4 bars in 4/4). */
export function averageSignedMs(offsets: readonly number[]): number {
  if (offsets.length === 0) return 0
  const sum = offsets.reduce((a, b) => a + b, 0)
  return sum / offsets.length
}
