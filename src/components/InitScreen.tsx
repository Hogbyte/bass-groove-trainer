import { Loader2, Settings } from 'lucide-react'

type Props = {
  onInitialize: () => void | Promise<void>
  initializing: boolean
  error: string | null
}

export function InitScreen({ onInitialize, initializing, error }: Props) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-indigo-950 px-4 py-12">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-xl">
        <h1 className="text-center text-3xl font-bold tracking-tight text-gray-900">
          Bass Groove Coach
        </h1>
        <p className="mt-2 text-center text-gray-600">
          Practice your micro-timing with real-time feedback
        </p>

        <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
          <p className="text-center font-semibold text-blue-900">
            Audio initialization is required to use this application.
          </p>
          <p className="mt-2 text-center text-sm text-blue-800">
            This enables the Web Audio API for accurate timing and microphone
            access.
          </p>
        </div>

        <button
          type="button"
          disabled={initializing}
          onClick={() => void onInitialize()}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3.5 text-base font-bold text-white shadow transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {initializing ? (
            <Loader2 className="h-5 w-5 shrink-0 animate-spin" aria-hidden />
          ) : (
            <Settings className="h-5 w-5 shrink-0" aria-hidden />
          )}
          Initialize Audio System
        </button>

        {error ? (
          <p className="mt-4 text-center text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  )
}
