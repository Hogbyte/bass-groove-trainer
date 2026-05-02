import * as Tone from 'tone'
import { useCallback, useEffect, useRef } from 'react'

export type MetronomeApi = {
  setBpm: (bpm: number) => void
  start: () => void
  stop: () => void
}

/**
 * Schedules a quarter-note kick on the Transport and owns the drum voice.
 * Call only after Tone.start() and while AudioProvider has wired the graph.
 */
export function useMetronome(bpm: number, enabledSynth: boolean): MetronomeApi {
  const repeatIdRef = useRef<number | null>(null)

  // BPM is synced in a separate effect so we do not recreate the synth on tempo changes.
  useEffect(() => {
    if (!enabledSynth) return

    const kick = new Tone.MembraneSynth({
      pitchDecay: 0.02,
      octaves: 2,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.05 },
    }).toDestination()
    kick.volume.value = -6

    Tone.Transport.bpm.value = bpm

    const id = Tone.Transport.scheduleRepeat(
      (time) => {
        kick.triggerAttackRelease('C2', '16n', time, 0.55)
      },
      '4n',
    )
    repeatIdRef.current = id

    return () => {
      if (repeatIdRef.current != null) {
        Tone.Transport.clear(repeatIdRef.current)
        repeatIdRef.current = null
      }
      kick.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- bpm handled below; avoid tearing down synth on tempo edits
  }, [enabledSynth])

  useEffect(() => {
    Tone.Transport.bpm.value = bpm
  }, [bpm])

  const setBpm = useCallback((next: number) => {
    Tone.Transport.bpm.value = next
  }, [])

  const start = useCallback(() => {
    Tone.Transport.start()
  }, [])

  const stop = useCallback(() => {
    Tone.Transport.stop()
  }, [])

  return {
    setBpm,
    start,
    stop,
  }
}
