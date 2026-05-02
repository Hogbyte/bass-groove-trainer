import { AudioProvider } from './audio/AudioProvider'
import { useAudioGate } from './audio/useAudioGate'
import { InitScreen } from './components/InitScreen'
import { PracticeLayout } from './components/PracticeLayout'

function Gate() {
  const { ready, error, initializing, initAudio } = useAudioGate()

  if (!ready) {
    return (
      <InitScreen
        onInitialize={initAudio}
        initializing={initializing}
        error={error}
      />
    )
  }

  return <PracticeLayout />
}

export default function App() {
  return (
    <AudioProvider>
      <Gate />
    </AudioProvider>
  )
}
