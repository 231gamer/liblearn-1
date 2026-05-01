export default function QuizLoading() {
  return (
    <div className="space-y-8">

      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-36 bg-gray-800 rounded-lg animate-pulse" />
        <div className="h-4 w-64 bg-gray-800 rounded-lg animate-pulse" />
      </div>

      {/* Quiz Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
            <div className="space-y-2">
              <div className="h-4 w-40 bg-gray-800 rounded animate-pulse" />
              <div className="h-3 w-52 bg-gray-800 rounded animate-pulse" />
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
  )
}