import { Settings } from 'lucide-react'

type Props = {
  calibrationMs: number
  onCalibrationChange: (ms: number) => void
  onsetSensitivity: number
  onOnsetSensitivityChange: (value: number) => void
}

export function SettingsPanel({
  calibrationMs,
  onCalibrationChange,
  onsetSensitivity,
  onOnsetSensitivityChange,
}: Props) {
  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <div className="mb-4 flex items-center gap-2">
        <Settings className="h-5 w-5 text-gray-700" aria-hidden />
        <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-800">How to use</h3>
        <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-gray-600">
          <li>Click &quot;Start Practice&quot; to begin.</li>
          <li>Play your bass along with the metronome.</li>
          <li>Watch your timing accuracy in real time.</li>
        </ol>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-800">Timing windows</h3>
        <ul className="mt-2 space-y-2 text-sm text-gray-600">
          <li className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-green-600" />
            Perfect: ±15ms
          </li>
          <li className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-yellow-500" />
            Good: ±30ms
          </li>
          <li className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-red-600" />
            Off: outside ±30ms (early or late)
          </li>
        </ul>
      </div>

      <div className="mt-6 border-t border-gray-100 pt-6">
        <label className="text-sm font-medium text-gray-800">
          Latency compensation (ms)
        </label>
        <p className="mt-1 text-xs text-gray-500">
          Add positive values if hits appear late; negative if they appear early.
          Centers readings against device delay.
        </p>
        <input
          type="range"
          min={-80}
          max={80}
          step={1}
          value={calibrationMs}
          onChange={(e) => onCalibrationChange(Number(e.target.value))}
          className="mt-3 w-full accent-indigo-600"
        />
        <div className="mt-1 text-right text-sm tabular-nums text-gray-700">
          {calibrationMs > 0 ? '+' : ''}
          {calibrationMs} ms
        </div>
      </div>

      <div className="mt-6 border-t border-gray-100 pt-6">
        <label className="text-sm font-medium text-gray-800">
          Onset sensitivity
        </label>
        <p className="mt-1 text-xs text-gray-500">
          Higher requires a stronger transient relative to noise (fewer false
          triggers).
        </p>
        <input
          type="range"
          min={2}
          max={12}
          step={0.5}
          value={onsetSensitivity}
          onChange={(e) => onOnsetSensitivityChange(Number(e.target.value))}
          className="mt-3 w-full accent-indigo-600"
        />
        <div className="mt-1 text-right text-sm tabular-nums text-gray-700">
          {onsetSensitivity.toFixed(1)}×
        </div>
      </div>

    </div>
  )
}
