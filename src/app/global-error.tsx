'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body className="bg-[#1a1a1a] text-white min-h-screen flex items-center justify-center px-4">
        <div className="max-w-xl mx-auto text-center">
          {/* Critical Error Icon */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/20 rounded-full mb-6">
              <svg
                className="w-10 h-10 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Critical Error
          </h1>
          <p className="text-gray-400 mb-8">
            A critical error has occurred. We&apos;re working to fix it as soon as possible.
          </p>

          {error.digest && (
            <p className="text-sm text-gray-500 font-mono mb-6">
              Reference: {error.digest}
            </p>
          )}

          <button
            onClick={reset}
            className="inline-flex items-center justify-center px-8 py-3 bg-[#fdc501] text-black font-semibold rounded-lg hover:bg-[#e5b101] transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Reload Application
          </button>
        </div>
      </body>
    </html>
  )
}
