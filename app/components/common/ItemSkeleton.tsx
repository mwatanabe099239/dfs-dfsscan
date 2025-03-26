export default function ItemSkeleton() {
  return (
    <div className="p-4">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
        <div className="min-w-[180px]">
          <div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-1" />
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="flex-1">
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="w-20 h-6 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  )
} 