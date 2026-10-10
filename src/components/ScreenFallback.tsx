import { Skeleton } from '@/components/ui'

export function ScreenFallback() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-28" />
      <Skeleton className="h-40" />
    </div>
  )
}
