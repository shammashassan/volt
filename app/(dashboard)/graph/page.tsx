import { getGraphDataAction } from "@/lib/actions/graph"
import { GraphView } from "@/components/graph-view"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Network } from "lucide-react"

function GraphSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6 pb-12 h-full overflow-hidden animate-pulse">
      {/* Header skeleton */}
      <section className="px-4 pt-8 lg:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between max-w-7xl">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                <Network className="size-6 animate-pulse" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-52 md:h-10" />
              </div>
            </div>
            <Skeleton className="h-6 w-96 max-w-full mt-2" />
          </div>
        </div>
      </section>

      {/* Main content skeleton mirroring the actual top-bar filter Graph layout */}
      <section className="px-4 lg:px-6 flex flex-col gap-4 flex-1 h-[calc(100vh-var(--header-height)-10rem)] overflow-hidden">
        {/* Horizontal filter bar skeleton */}
        <div className="p-3 border border-border/40 bg-card/30 backdrop-blur-xs rounded-2xl flex flex-col gap-3 md:flex-row md:items-center">
          {/* Search Input skeleton */}
          <Skeleton className="h-9 flex-1 rounded-lg" />
          {/* Toggle items skeleton */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="size-7 rounded-md animate-pulse" />
            ))}
          </div>
        </div>

        {/* Canvas Panel Skeleton */}
        <div className="flex-1 border border-border/40 bg-card/20 rounded-2xl flex items-center justify-center min-h-[350px] lg:min-h-0 relative overflow-hidden">
          <div className="flex flex-col items-center gap-3 animate-pulse">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-4 w-36 rounded" />
          </div>
        </div>
      </section>
    </div>
  )
}

async function GraphContentWrapper() {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  if (!session) {
    redirect("/login")
  }

  const result = await getGraphDataAction()
  
  if (!result.success || !result.data) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-destructive">
        Failed to load knowledge graph: {result.error || "Unknown error"}
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden">
      <section className="px-4 pt-8 lg:px-6 shrink-0">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between max-w-7xl">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                <Network className="size-6" />
              </div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-black tracking-tight md:text-4xl bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/60">
                  Knowledge Graph
                </h1>
              </div>
            </div>
            <p className="text-lg text-muted-foreground/80 max-w-2xl font-medium">
              Visualize connection vectors and bidirectional links in your personal knowledge operating system.
            </p>
          </div>
        </div>
      </section>

      <GraphView data={result.data} />
    </div>
  )
}

export default function GraphPage() {
  return (
    <Suspense fallback={<GraphSkeleton />}>
      <GraphContentWrapper />
    </Suspense>
  )
}
