import { Guitar } from 'lucide-react'
import { useState } from 'react'
import { useAudioEngine } from '../audio/useAudioEngine'
import { PracticeControl } from './PracticeControl'
import { PracticeSummaryModal } from './PracticeSummaryModal'
import { SettingsPanel } from './SettingsPanel'
import { TimingCanvas } from './TimingCanvas'

const DEFAULT_BPM = 100

export function PracticeLayout() {
  const [bpm, setBpm] = useState(DEFAULT_BPM)
  const [calibrationMs, setCalibrationMs] = useState(0)
  const [onsetSensitivity, setOnsetSensitivity] = useState(4)

  const engine = useAudioEngine(bpm, calibrationMs, onsetSensitivity)

  return (
    <div className="min-h-screen bg-indigo-950 px-4 pb-12 pt-10">
      <header className="mx-auto max-w-6xl text-center">
        <div className="flex items-center justify-center gap-3">
          <Guitar
            className="h-10 w-10 shrink-0 text-indigo-200 sm:h-12 sm:w-12"
            aria-hidden
            strokeWidth={1.75}
          />
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Bass Groove Coach
          </h1>
        </div>
        <p className="mt-2 text-indigo-200">
          Practice your micro-timing with real-time feedback
        </p>
      </header>

      {engine.sessionSummary ? (
        <PracticeSummaryModal
          summary={engine.sessionSummary}
          onDismiss={engine.dismissSessionSummary}
        />
      ) : null}

      <div className="mx-auto mt-10 grid max-w-6xl gap-6 lg:grid-cols-3">
        <PracticeControl
          bpm={bpm}
          onBpmChange={setBpm}
          isPlaying={engine.isPlaying}
          onStart={engine.startPractice}
          onStop={engine.stopPractice}
          beatInBar={engine.beatInBar}
          inputLevel={engine.inputLevel}
        />

        <TimingCanvas
          hits={engine.recentHits}
          averageOffsetMs={engine.averageOffsetMs}
          totalHits={engine.totalHits}
          sessionSeconds={engine.sessionSeconds}
        />

        <SettingsPanel
          calibrationMs={calibrationMs}
          onCalibrationChange={setCalibrationMs}
          onsetSensitivity={onsetSensitivity}
          onOnsetSensitivityChange={setOnsetSensitivity}
        />
      </div>
    </div>
  )
}
