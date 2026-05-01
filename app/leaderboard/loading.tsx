export default function LeaderboardLoading() {
  return (
    <div className="space-y-8">

      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-40 bg-gray-800 rounded-lg animate-pulse" />
        <div className="h-4 w-72 bg-gray-800 rounded-lg animate-pulse" />
      </div>

      {/* Your Rank Banner Skeleton */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-800 rounded-full animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-24 bg-gray-800 rounded animate-pulse" />
            <div className="h-3 w-32 bg-gray-800 rounded animate-pulse" />
          </div>
        </div>
        <div className="space-y-1.5 text-right">
          <div className="h-5 w-16 bg-gray-800 rounded animate-pulse" />
          <div className="h-3 w-12 bg-gray-800 rounded animate-pulse" />
        </div>
      </div>

      {/* Top 3 Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3 text-center">
            <div className="w-10 h-10 bg-gray-800 rounded-full mx-auto animate-pulse" />
            <div className="w-12 h-12 bg-gray-800 rounded-full mx-auto animate-pulse" />
            <div className="h-4 w-28 bg-gray-800 rounded mx-auto animate-pulse" />
            <div className="h-6 w-16 bg-gray-800 rounded mx-auto animate-pulse" />
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="border-b border-gray-800 px-5 py-3 flex gap-4">
          <div className="h-3 w-10 bg-gray-800 rounded animate-pulse" />
          <div className="h-3 w-24 bg-gray-800 rounded animate-pulse" />
        </div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-800 rounded-full animate-pulse" />
              <div className="h-4 w-36 bg-gray-800 rounded animate-pulse" />
            </div>
            <div className="h-4 w-16 bg-gray-800 rounded animate-pulse" />
          </div>
        ))}
      </div>

    </div>
  )
}