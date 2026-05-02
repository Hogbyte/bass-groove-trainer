import { useEffect, useId } from 'react'
import type { SessionSummary } from '../audio/sessionSummary'

type Props = {
  summary: SessionSummary
  onDismiss: () => void
}

function formatDuration(sec: number): string {
  if (sec < 60) {
    return `${sec.toFixed(1)} s`
  }
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function PracticeSummaryModal({ summary, onDismiss }: Props) {
  const titleId = useId()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onDismiss])

  const rows: { label: string; value: string; valueClass?: string }[] = [
    { label: 'Time practiced', value: formatDuration(summary.durationSec) },
    {
      label: 'Total beats',
      value: String(summary.totalBeats),
    },
    {
      label: 'Total hits',
      value: String(summary.totalHits),
    },
    {
      label: 'Perfect (±15 ms)',
      value: String(summary.perfect),
      valueClass: 'text-green-700',
    },
    {
      label: 'Good (±30 ms)',
      value: String(summary.good),
      valueClass: 'text-yellow-700',
    },
    {
      label: 'Off',
      value: String(summary.off),
      valueClass: 'text-red-700',
    },
    {
      label: 'Beats missed',
      value: String(summary.missedBeats),
    },
  ]

  if (summary.onTimePercent != null) {
    rows.push({
      label: 'On-time rate (good + perfect)',
      value: `${summary.onTimePercent}%`,
    })
  }

  rows.push({
    label: 'Mean |offset| (hits)',
    value: `${summary.meanAbsOffsetMs.toFixed(1)} ms`,
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onDismiss}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id={titleId}
          className="text-xl font-bold tracking-tight text-gray-900"
        >
          Practice summary
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Here&apos;s how this session went.
        </p>

        <dl className="mt-6 space-y-3 border-t border-gray-100 pt-4">
          {rows.map(({ label, value, valueClass }) => (
            <div
              key={label}
              className="flex items-baseline justify-between gap-4 text-sm"
            >
              <dt className="text-gray-600">{label}</dt>
              <dd
                className={`font-semibold tabular-nums ${valueClass ?? 'text-gray-900'}`}
              >
                {value}
              </dd>
            </div>
          ))}
        </dl>

        <button
          type="button"
          className="mt-8 w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-indigo-500"
          onClick={onDismiss}
        >
          Close
        </button>
      </div>
    </div>
  )
}
