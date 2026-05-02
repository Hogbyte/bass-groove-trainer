import { createContext, type RefObject } from 'react'

export type AudioGateContextValue = {
  ready: boolean
  error: string | null
  initializing: boolean
  initAudio: () => Promise<void>
  analyserRef: RefObject<AnalyserNode | null>
  nativeContextRef: RefObject<AudioContext | null>
}

export const AudioGateContext = createContext<AudioGateContextValue | null>(null)
