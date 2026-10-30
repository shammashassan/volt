import { Skeleton } from "@/components/ui/skeleton"

export default function SettingsLoading() {
  return (
    <div className="flex flex-1 flex-col gap-8 pb-12 px-4 pt-8 lg:px-8 max-w-5xl mx-auto w-full animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>

      {/* Profile Card */}
      <div className="rounded-2xl border border-border/50 bg-card/40 p-6 space-y-6 backdrop-blur-xs">
        <div className="flex items-center gap-4">
          <Skeleton className="size-16" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-60" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
      </div>

      {/* Security Cards */}
      <div className="rounded-2xl border border-border/50 bg-card/40 p-6 space-y-4 backdrop-blur-xs">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-72" />
        <Skeleton className="h-10 w-36" />
      </div>

      <div className="rounded-2xl border border-border/50 bg-card/40 p-6 space-y-4 backdrop-blur-xs">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-4 w-80" />
        <Skeleton className="h-20 w-full" />
      </div>
    </div>
  )
}
