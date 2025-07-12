
import { cn } from "@/lib/utils"

interface LoadingSkeletonProps {
  className?: string
  count?: number
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  className, 
  count = 1 
}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "animate-pulse rounded-md bg-muted",
            className
          )}
        />
      ))}
    </>
  )
}

export const StatsCardSkeleton: React.FC = () => (
  <div className="rounded-lg border bg-card p-6 space-y-3">
    <div className="flex items-center justify-between">
      <LoadingSkeleton className="h-4 w-24" />
      <LoadingSkeleton className="h-8 w-8 rounded-lg" />
    </div>
    <LoadingSkeleton className="h-8 w-16" />
    <LoadingSkeleton className="h-4 w-20" />
  </div>
)

export const ActivityItemSkeleton: React.FC = () => (
  <div className="flex items-center justify-between p-3 border rounded-lg space-x-3">
    <div className="flex items-center space-x-3 flex-1">
      <LoadingSkeleton className="w-4 h-4" />
      <div className="space-y-2 flex-1">
        <LoadingSkeleton className="h-4 w-3/4" />
        <LoadingSkeleton className="h-3 w-1/2" />
      </div>
    </div>
    <LoadingSkeleton className="h-6 w-16 rounded-full" />
  </div>
)
