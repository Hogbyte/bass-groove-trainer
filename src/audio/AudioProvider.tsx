import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { AudioGateContext } from './audioGateContext'
import { getNativeAudioContext, startTone } from './audioContext'

export function AudioProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [initializing, setInitializing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyserRef = useRef<AnalyserNode | null>(null)
  const nativeContextRef = useRef<AudioContext | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  const initAudio = useCallback(async () => {
    setError(null)
    setInitializing(true)
    try {
      await startTone()
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      })
      streamRef.current = stream

      const ctx = getNativeAudioContext()
      nativeContextRef.current = ctx

      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 2048
      analyser.smoothingTimeConstant = 0.35
      source.connect(analyser)
      analyserRef.current = analyser

      setReady(true)
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : 'Could not access microphone or audio.'
      setError(msg)
      setReady(false)
    } finally {
      setInitializing(false)
    }
  }, [])

  const value = useMemo(
    () => ({
      ready,
      error,
      initializing,
      initAudio,
      analyserRef,
      nativeContextRef,
    }),
    [ready, error, initializing, initAudio],
  )

  return (
    <AudioGateContext.Provider value={value}>
      {children}
    </AudioGateContext.Provider>
  )
}
