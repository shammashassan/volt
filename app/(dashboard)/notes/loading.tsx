import { Skeleton } from "@/components/ui/skeleton"

export default function NotesLoading() {
  return (
    <div className="h-[calc(100dvh-var(--header-height))] border-t border-border overflow-hidden flex animate-pulse">
      {/* Sidebar / List Panel Skeleton */}
      <div className="w-[28%] border-r border-border flex flex-col h-full bg-muted/10 shrink-0 hidden md:flex">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2.5">
            <Skeleton className="size-5" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-8" />
          </div>
          <Skeleton className="size-9" />
        </div>
        {/* Search */}
        <div className="px-4 py-3 border-b border-border shrink-0">
          <Skeleton className="h-9 w-full" />
        </div>
        {/* Tag filters */}
        <div className="px-4 py-3 border-b border-border shrink-0 flex gap-2">
          <Skeleton className="h-6 w-12" />
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-14" />
        </div>
        {/* Note list */}
        <div className="flex-1 p-3 flex flex-col gap-3 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl p-4 border border-transparent bg-muted/5 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-[60%]" />
                <Skeleton className="h-2 w-2" />
              </div>
              <Skeleton className="h-3 w-[85%]" />
              <Skeleton className="h-3 w-[50%]" />
              <div className="flex items-center justify-between mt-1">
                <div className="flex gap-1.5">
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-5 w-14" />
                </div>
                <Skeleton className="h-3 w-10" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main / Detail Panel Skeleton */}
      <div className="flex-1 flex flex-col h-full bg-background">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <Skeleton className="size-9 md:hidden" />
            <Skeleton className="h-5 w-32 md:hidden" />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Skeleton className="h-9 w-16" />
            <Skeleton className="size-9" />
            <Skeleton className="size-9" />
          </div>
        </div>
        {/* Document body */}
        <div className="flex-1 p-8 md:p-12 max-w-2xl mx-auto w-full flex flex-col gap-6">
          <div className="flex items-start justify-between gap-4">
            <Skeleton className="h-10 w-[70%]" />
            <Skeleton className="h-6 w-32 shrink-0 hidden sm:block" />
          </div>
          {/* Tag row */}
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-px w-full" />
          {/* Content paragraphs */}
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[95%]" />
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[40%]" />
          </div>
          <div className="flex flex-col gap-3 mt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[97%]" />
            <Skeleton className="h-4 w-[85%]" />
          </div>
        </div>
      </div>
    </div>
  )
}
