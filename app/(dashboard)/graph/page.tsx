import { getGraphDataAction } from "@/lib/actions/graph"
import { GraphView } from "@/components/dashboard/graph-view"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Network } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Knowledge Graph",
  description: "Visualize connection vectors and bidirectional links in your personal knowledge network.",
}

export default async function GraphPage() {
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

