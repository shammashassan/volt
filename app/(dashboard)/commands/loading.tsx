import { Skeleton } from "@/components/ui/skeleton"

export default function CommandsLoading() {
  return (
    <div className="flex flex-1 flex-col gap-6 pb-12 @container/main">
      {/* Header section */}
      <section className="px-4 pt-8 lg:px-6">
        <div className="flex flex-col gap-4 max-w-7xl">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <Skeleton className="size-12" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-48 md:h-10" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
            <Skeleton className="h-5 w-80 max-w-full" />
          </div>
        </div>
      </section>

      {/* Categorized groups section */}
      <section className="px-4 lg:px-6">
        <div className="max-w-7xl flex flex-col gap-12">
          <div className="grid gap-12">
            {Array.from({ length: 3 }).map((_, groupIndex) => (
              <section key={groupIndex} className="flex flex-col gap-6">
                {/* Group category header */}
                <div className="flex items-center gap-3">
                  <Skeleton className="size-10" />
                  <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-5 w-36" />
                    <Skeleton className="h-4 w-64 max-w-full" />
                  </div>
                </div>

                {/* 2-column command snippets grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Array.from({ length: 2 }).map((_, cmdIndex) => (
                    <div key={cmdIndex} className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3.5 w-60 max-w-full" />
                      </div>
                      <div className="rounded-xl border border-border/50 bg-muted/20 overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between border-b border-border/40 px-3.5 py-2">
                          <Skeleton className="h-5 w-24" />
                          <Skeleton className="size-7" />
                        </div>
                        <div className="p-4 flex flex-col gap-2">
                          <Skeleton className="h-4 w-3/4" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Need more bottom banner */}
          <div className="mt-8 p-8 rounded-3xl border border-border/40 flex flex-col items-center text-center gap-4">
            <Skeleton className="size-12" />
            <div className="flex flex-col items-center gap-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-72 max-w-full" />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
