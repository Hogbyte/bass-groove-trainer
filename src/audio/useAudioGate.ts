import { useContext } from 'react'
import { AudioGateContext, type AudioGateContextValue } from './audioGateContext'

export function useAudioGate(): AudioGateContextValue {
  const ctx = useContext(AudioGateContext)
  if (!ctx) {
    throw new Error('useAudioGate must be used within AudioProvider')
  }
  return ctx
}
