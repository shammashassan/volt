import { Skeleton } from "@/components/ui/skeleton"

export default function ShareLoading() {
  return (
    <div className="flex flex-1 items-center justify-center p-4 lg:p-6 min-h-[calc(100vh-var(--header-height)-4rem)] animate-pulse">
      <div className="w-full max-w-md p-6 border rounded-2xl bg-card/50 backdrop-blur-xs flex flex-col gap-4">
        <Skeleton className="h-6 w-32 rounded" />
        <Skeleton className="h-4 w-48 rounded" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded" />
      </div>
    </div>
  )
}
