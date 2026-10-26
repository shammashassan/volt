import { Skeleton } from "@/components/ui/skeleton"

export default function NotesLoading() {
  return (
    <div className="h-[calc(100dvh-var(--header-height))] border-t border-border overflow-hidden flex animate-pulse">
      {/* Sidebar / List Panel Skeleton */}
      <div className="w-[28%] border-r border-border flex flex-col h-full bg-muted/10 shrink-0 hidden md:flex">
        <div className="flex items-center justify-between px-4 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2.5">
            <Skeleton className="size-5 rounded-md" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-8 rounded-full" />
          </div>
          <Skeleton className="size-9 rounded-md" />
        </div>
        <div className="px-4 py-3 border-b border-border shrink-0">
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
        <div className="px-4 py-3 border-b border-border shrink-0 flex gap-2">
          <Skeleton className="h-6 w-12 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
        <div className="flex-1 p-3 flex flex-col gap-3 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-xl p-4 border border-transparent bg-muted/5 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-[60%] rounded" />
                <Skeleton className="h-2 w-2 rounded-full bg-muted" />
              </div>
              <Skeleton className="h-3 w-full rounded" />
              <div className="flex items-center gap-2 mt-1">
                <Skeleton className="h-4 w-12 rounded-full" />
                <Skeleton className="h-3 w-16 rounded ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Note Editor Skeleton */}
      <div className="flex-1 flex flex-col h-full bg-background overflow-hidden">
        <div className="px-8 py-6 border-b border-border flex items-center justify-between">
          <Skeleton className="h-8 w-64 rounded-md" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-20 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
          </div>
        </div>
        <div className="p-8 space-y-4 max-w-3xl">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-[90%] rounded" />
          <Skeleton className="h-4 w-[95%] rounded" />
          <Skeleton className="h-4 w-[80%] rounded" />
        </div>
      </div>
    </div>
  )
}
