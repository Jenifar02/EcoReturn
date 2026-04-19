'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md panel">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl"
          style={{ background: 'rgba(220,38,38,0.08)' }}
        >
          ⚠️
        </div>
        <h2 className="text-2xl font-black mb-2" style={{ letterSpacing: '-0.02em' }}>
          Something went wrong
        </h2>
        <p className="opacity-60 text-sm mb-6">
          An unexpected error occurred. Please try again.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="btn-eco px-6 py-2.5">
            Try again
          </button>
          <Link href="/" className="btn-outline-eco px-6 py-2.5">
            Go home
          </Link>
        </div>
      </div>
    </main>
  )
}
