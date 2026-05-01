export default function DashboardLoading() {
  return (
    <div className="space-y-8">

      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-48 bg-gray-800 rounded-lg animate-pulse" />
        <div className="h-4 w-32 bg-gray-800 rounded-lg animate-pulse" />
      </div>

      {/* Stats Row Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3">
            <div className="h-3 w-24 bg-gray-800 rounded animate-pulse" />
            <div className="h-9 w-16 bg-gray-800 rounded animate-pulse" />
            <div className="h-3 w-20 bg-gray-800 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Progress Bar Skeleton */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3">
        <div className="flex justify-between">
          <div className="h-4 w-32 bg-gray-800 rounded animate-pulse" />
          <div className="h-4 w-20 bg-gray-800 rounded animate-pulse" />
        </div>
        <div className="w-full bg-gray-800 rounded-full h-3 animate-pulse" />
      </div>

      {/* Quiz Cards Skeleton */}
      <div className="space-y-4">
        <div className="h-5 w-36 bg-gray-800 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
              <div className="space-y-2">
                <div className="h-4 w-40 bg-gray-800 rounded animate-pulse" />
                <div className="h-3 w-56 bg-gray-800 rounded animate-pulse" />
              </div>
              <div className="flex gap-2">
                <div className="h-5 w-16 bg-gray-800 rounded-full animate-pulse" />
                <div className="h-5 w-12 bg-gray-800 rounded-full animate-pulse" />
                <div className="h-5 w-14 bg-gray-800 rounded-full animate-pulse" />
              </div>
              <div className="h-9 w-full bg-gray-800 rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}