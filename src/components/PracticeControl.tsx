import { Play, SlidersHorizontal, Square, Volume2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAudioGate } from '../audio/useAudioGate'

type Props = {
  bpm: number
  onBpmChange: (bpm: number) => void
  isPlaying: boolean
  onStart: () => void
  onStop: () => void
  beatInBar: number
  inputLevel: number
}

export function PracticeControl({
  bpm,
  onBpmChange,
  isPlaying,
  onStart,
  onStop,
  beatInBar,
  inputLevel,
}: Props) {
  const { nativeContextRef } = useAudioGate()
  const [latencyInfo, setLatencyInfo] = useState({
    sampleRate: '—',
    outputMs: '—',
  })

  useEffect(() => {
    const ctx = nativeContextRef.current
    if (!ctx) return
    const sr = `${Math.round(ctx.sampleRate)}Hz`
    let out = '—'
    if (typeof ctx.outputLatency === 'number') {
      out = `${(ctx.outputLatency * 1000).toFixed(2)}ms`
    } else if (typeof ctx.baseLatency === 'number') {
      out = `${(ctx.baseLatency * 1000).toFixed(2)}ms (base)`
    }
    setLatencyInfo({ sampleRate: sr, outputMs: out })
  }, [nativeContextRef])

  const pct = Math.min(100, inputLevel * 100)
  const showInputMeter = isPlaying

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <div className="mb-4 flex items-center gap-2">
        <SlidersHorizontal className="h-5 w-5 text-gray-700" aria-hidden />
        <h2 className="text-lg font-semibold text-gray-900">Practice Control</h2>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="bpm" className="text-sm font-medium text-gray-700">
            BPM:
          </label>
          <span className="tabular-nums text-sm font-medium text-gray-900">
            {bpm}
          </span>
        </div>
        <input
          id="bpm"
          type="range"
          min={60}
          max={200}
          step={1}
          value={bpm}
          disabled={isPlaying}
          onChange={(e) => onBpmChange(Number(e.target.value))}
          className="mt-2 w-full accent-blue-600 disabled:opacity-60"
        />
      </div>

      <button
        type="button"
        onClick={isPlaying ? onStop : onStart}
        className={`mt-6 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3.5 text-base font-bold text-white shadow transition ${
          isPlaying
            ? 'bg-red-600 hover:bg-red-500'
            : 'bg-green-600 hover:bg-green-500'
        }`}
      >
        {isPlaying ? (
          <>
            <Square className="h-5 w-5 fill-current" aria-hidden />
            Stop Practice
          </>
        ) : (
          <>
            <Play className="h-5 w-5 fill-current" aria-hidden />
            Start Practice
          </>
        )}
      </button>

      <div className="mt-8">
        <p className="mb-3 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
          Beat
        </p>
        <div className="flex justify-center gap-3">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold ${
                beatInBar === n
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {n}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Volume2 className="h-4 w-4" aria-hidden />
            Input Level
          </div>
          <span className="min-h-[1.25rem] text-sm tabular-nums text-gray-600">
            {showInputMeter ? `${pct.toFixed(1)}%` : ''}
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-blue-500 transition-[width] duration-75"
            style={{ width: showInputMeter ? `${pct}%` : '0%' }}
          />
        </div>
      </div>

      <div className="mt-8 space-y-1 text-xs text-gray-500">
        <p>
          Output latency:{' '}
          <span className="tabular-nums text-gray-700">{latencyInfo.outputMs}</span>
        </p>
        <p>
          Sample rate:{' '}
          <span className="tabular-nums text-gray-700">
            {latencyInfo.sampleRate}
          </span>
        </p>
      </div>
    </div>
  )
}
