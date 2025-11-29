import Link from 'next/link'

export default function GroodNotFound() {
  return (
    <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center px-4 pt-20">
      <div className="max-w-2xl mx-auto text-center">
        {/* Animated 404 */}
        <div className="relative mb-8">
          <h1 className="text-[180px] md:text-[240px] font-bold text-gray-200 select-none leading-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-[#fdc501] rounded-full p-6 shadow-xl">
              <svg
                className="w-16 h-16 md:w-24 md:h-24 text-black"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Message */}
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          Oops! Page not found
        </h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          The page you&apos;re looking for seems to have taken a different route. 
          Let&apos;s get you back on track.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-[#fdc501] text-black font-semibold rounded-lg hover:bg-[#e5b101] transition-colors"
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
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Go Home
          </Link>
          <Link
            href="/our-rides"
            className="inline-flex items-center justify-center px-6 py-3 border-2 border-gray-900 text-gray-900 font-semibold rounded-lg hover:bg-gray-900 hover:text-white transition-colors"
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
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            Explore E-Bikes
          </Link>
        </div>

        {/* Quick Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Popular destinations:</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/accessories"
              className="text-sm text-gray-600 hover:text-[#fdc501] transition-colors"
            >
              Accessories
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="/find-store"
              className="text-sm text-gray-600 hover:text-[#fdc501] transition-colors"
            >
              Find a Store
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="/contact"
              className="text-sm text-gray-600 hover:text-[#fdc501] transition-colors"
            >
              Contact Us
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="/blog"
              className="text-sm text-gray-600 hover:text-[#fdc501] transition-colors"
            >
              Blog
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
