import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">

        <div className="text-8xl">🗺️</div>

        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-white">404</h1>
          <p className="text-xl font-semibold text-gray-300">Page Not Found</p>
          <p className="text-gray-500 text-sm">
            Looks like this page got lost in the jungle. Let's get you back on track.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-2.5 text-sm font-semibold border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white rounded-xl transition"
          >
            ← Back to Home
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-2.5 text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-gray-950 rounded-xl transition"
          >
            Go to Dashboard
          </Link>
        </div>

      </div>
    </div>
  )
}