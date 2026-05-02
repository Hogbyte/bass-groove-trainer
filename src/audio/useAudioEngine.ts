import * as Tone from 'tone'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useAudioGate } from './useAudioGate'
import { OnsetDetector, rmsFromFloat32Channel } from './onsetDetection'
import type { SessionSummary } from './sessionSummary'
import {
  averageSignedMs,
  classifyTiming,
  nearestBeatOffsetMs,
  nearestQuarterBeatIndex,
  type TimingBand,
} from './timingMath'
import { useMetronome } from './useMetronome'

export type HitMarker = { offsetMs: number; band: TimingBand }

export function useAudioEngine(
  bpm: number,
  calibrationMs: number,
  onsetSensitivity = 4,
) {
  const { ready, analyserRef } = useAudioGate()
  useMetronome(bpm, ready)

  const bpmRef = useRef(bpm)
  const calRef = useRef(calibrationMs)
  useEffect(() => {
    bpmRef.current = bpm
  }, [bpm])
  useEffect(() => {
    calRef.current = calibrationMs
  }, [calibrationMs])

  const [isPlaying, setIsPlaying] = useState(false)
  const [inputLevel, setInputLevel] = useState(0)
  const [beatInBar, setBeatInBar] = useState(1)
  const [recentHits, setRecentHits] = useState<HitMarker[]>([])
  const [averageOffsetMs, setAverageOffsetMs] = useState(0)
  const [totalHits, setTotalHits] = useState(0)
  const [sessionSeconds, setSessionSeconds] = useState(0)
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(
    null,
  )
  const [, setRollingOffsets] = useState<number[]>([])

  const detectorRef = useRef(
    new OnsetDetector({ sensitivity: onsetSensitivity }),
  )
  const sessionStartRef = useRef<number | null>(null)
  const lastBeatIdxRef = useRef(0)

  const perfectCountRef = useRef(0)
  const goodCountRef = useRef(0)
  const offCountRef = useRef(0)
  const hitBeatIndicesRef = useRef<Set<number>>(new Set())
  const sumAbsOffsetRef = useRef(0)

  useEffect(() => {
    detectorRef.current = new OnsetDetector({ sensitivity: onsetSensitivity })
  }, [onsetSensitivity])

  const startPractice = useCallback(() => {
    Tone.Transport.stop()
    Tone.Transport.seconds = 0
    detectorRef.current.reset()
    lastBeatIdxRef.current = -1
    perfectCountRef.current = 0
    goodCountRef.current = 0
    offCountRef.current = 0
    hitBeatIndicesRef.current = new Set()
    sumAbsOffsetRef.current = 0
    setTotalHits(0)
    setRollingOffsets([])
    setRecentHits([])
    setAverageOffsetMs(0)
    setSessionSummary(null)
    sessionStartRef.current = performance.now()
    setSessionSeconds(0)
    Tone.Transport.start()
    setIsPlaying(true)
  }, [])

  const dismissSessionSummary = useCallback(() => {
    setSessionSummary(null)
  }, [])

  const stopPractice = useCallback(() => {
    const beatDur = 60 / bpmRef.current
    const transportSeconds = Tone.Transport.seconds
    const durationSec =
      sessionStartRef.current != null
        ? (performance.now() - sessionStartRef.current) / 1000
        : 0

    const totalBeats =
      transportSeconds > 0
        ? Math.floor(transportSeconds / beatDur) + 1
        : 0

    let covered = 0
    for (let i = 0; i < totalBeats; i++) {
      if (hitBeatIndicesRef.current.has(i)) {
        covered++
      }
    }
    const missedBeats = Math.max(0, totalBeats - covered)

    const p = perfectCountRef.current
    const g = goodCountRef.current
    const o = offCountRef.current
    const totalHitCount = p + g + o
    const meanAbsOffsetMs =
      totalHitCount > 0 ? sumAbsOffsetRef.current / totalHitCount : 0
    const onTimePercent =
      totalHitCount > 0
        ? Math.round(((p + g) / totalHitCount) * 1000) / 10
        : null

    Tone.Transport.stop()
    sessionStartRef.current = null
    setIsPlaying(false)

    setSessionSummary({
      durationSec,
      totalBeats,
      totalHits: totalHitCount,
      perfect: p,
      good: g,
      off: o,
      missedBeats,
      meanAbsOffsetMs,
      onTimePercent,
    })
  }, [])

  useEffect(() => {
    if (!ready) return
    const analyser = analyserRef.current
    if (!analyser) return

    const detector = detectorRef.current

    let frameId = 0

    const loop = () => {
      const buf = new Float32Array(analyser.fftSize)
      analyser.getFloatTimeDomainData(buf)
      const rms = rmsFromFloat32Channel(buf)
      setInputLevel(Math.min(1, rms * 10))

      if (Tone.Transport.state === 'started') {
        const bd = 60 / bpmRef.current
        const idx = Math.floor(Tone.Transport.seconds / bd) % 4
        if (idx !== lastBeatIdxRef.current) {
          lastBeatIdxRef.current = idx
          setBeatInBar(idx + 1)
        }

        if (sessionStartRef.current != null) {
          setSessionSeconds(
            (performance.now() - sessionStartRef.current) / 1000,
          )
        }

        if (detector.process(rms, performance.now())) {
          const raw = nearestBeatOffsetMs(
            Tone.Transport.seconds,
            bpmRef.current,
          )
          const offsetMs = raw + calRef.current
          const band = classifyTiming(offsetMs)

          if (band === 'perfect') {
            perfectCountRef.current += 1
          } else if (band === 'good') {
            goodCountRef.current += 1
          } else {
            offCountRef.current += 1
          }
          const beatIdx = nearestQuarterBeatIndex(
            Tone.Transport.seconds,
            bpmRef.current,
          )
          hitBeatIndicesRef.current.add(beatIdx)
          sumAbsOffsetRef.current += Math.abs(offsetMs)

          setTotalHits((n) => n + 1)
          setRollingOffsets((prev) => {
            const next = [...prev, offsetMs]
            const trimmed =
              next.length > 16 ? next.slice(next.length - 16) : next
            setAverageOffsetMs(averageSignedMs(trimmed))
            return trimmed
          })
          setRecentHits((prev) => {
            const next = [...prev, { offsetMs, band }]
            return next.length > 48 ? next.slice(next.length - 48) : next
          })
        }
      }

      frameId = requestAnimationFrame(loop)
    }

    frameId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frameId)
  }, [ready, analyserRef])

  return {
    isPlaying,
    inputLevel,
    beatInBar,
    recentHits,
    averageOffsetMs,
    totalHits,
    sessionSeconds,
    sessionSummary,
    startPractice,
    stopPractice,
    dismissSessionSummary,
  }
}
