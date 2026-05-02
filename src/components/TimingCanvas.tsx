import { Activity } from 'lucide-react'
import { useEffect, useRef } from 'react'
import type { HitMarker } from '../audio/useAudioEngine'

type Props = {
  hits: HitMarker[]
  averageOffsetMs: number
  totalHits: number
  sessionSeconds: number
}

const MAX_MS = 80

export function TimingCanvas({
  hits,
  averageOffsetMs,
  totalHits,
  sessionSeconds,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return

    const draw = () => {
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const wCss = wrap.clientWidth
      const hCss = 180
      const dpr = window.devicePixelRatio || 1

      canvas.style.width = `${wCss}px`
      canvas.style.height = `${hCss}px`
      canvas.width = Math.floor(wCss * dpr)
      canvas.height = Math.floor(hCss * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const w = wCss
      const h = hCss

      ctx.fillStyle = '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      ctx.strokeStyle = '#e2e8f0'
      ctx.strokeRect(0.5, 0.5, w - 1, h - 1)

      const mid = w / 2
      ctx.strokeStyle = '#2563eb'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(mid, 12)
      ctx.lineTo(mid, h - 28)
      ctx.stroke()

      ctx.fillStyle = '#64748b'
      ctx.font = '12px system-ui, sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText('Early', 10, 22)
      ctx.textAlign = 'right'
      ctx.fillText('Late', w - 10, 22)
      ctx.textAlign = 'center'
      ctx.fillText('Perfect', mid, h - 10)

      const cy = h / 2 - 4
      hits.forEach((hit) => {
        const x = mid + (hit.offsetMs / MAX_MS) * (mid - 28)
        const clamped = Math.max(14, Math.min(w - 14, x))
        ctx.fillStyle =
          hit.band === 'perfect'
            ? '#16a34a'
            : hit.band === 'good'
              ? '#ca8a04'
              : '#dc2626'
        ctx.beginPath()
        ctx.arc(clamped, cy, 5, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    draw()

    const ro = new ResizeObserver(draw)
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [hits])

  const fmtSec = (s: number) => `${Math.floor(s)}s`

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <div className="mb-4 flex items-center gap-2">
        <Activity className="h-5 w-5 text-gray-700" aria-hidden />
        <h2 className="text-lg font-semibold text-gray-900">
          Timing Visualization
        </h2>
      </div>

      <div ref={wrapRef} className="w-full">
        <canvas ref={canvasRef} className="block w-full rounded-md" />
      </div>

      <dl className="mt-6 grid gap-3 text-sm">
        <div className="flex justify-between gap-4 border-t border-gray-100 pt-3">
          <dt className="text-gray-600">Average offset</dt>
          <dd
            className={`tabular-nums font-semibold ${
              Math.abs(averageOffsetMs) <= 15
                ? 'text-green-600'
                : Math.abs(averageOffsetMs) <= 30
                  ? 'text-yellow-600'
                  : 'text-gray-900'
            }`}
          >
            {averageOffsetMs.toFixed(1)}ms
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-gray-600">Total hits</dt>
          <dd className="tabular-nums font-medium text-gray-900">{totalHits}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-gray-600">Session time</dt>
          <dd className="tabular-nums font-medium text-gray-900">
            {fmtSec(sessionSeconds)}
          </dd>
        </div>
      </dl>
    </div>
  )
}
