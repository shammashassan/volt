import { Skeleton } from "@/components/ui/skeleton"

export default function QuickSaveLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background/95 p-4 md:p-8 animate-pulse">
      <div className="w-full max-w-[420px] rounded-2xl border border-border/80 bg-card/60 p-6 shadow-2xl backdrop-blur-xl">
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}
