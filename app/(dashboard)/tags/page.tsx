import { getResources, getNotes, getPeople } from "@/lib/db"
import { TagsContent } from "./tags-content"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

function TagsSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6 pb-12">
      {/* Header section */}
      <section className="px-4 pt-8 lg:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between max-w-7xl">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              {/* Icon skeleton */}
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="flex items-center gap-2">
                {/* Title skeleton */}
                <Skeleton className="h-9 w-40 md:h-10" />
                {/* Badge skeleton */}
                <Skeleton className="h-6 w-28 rounded-full" />
              </div>
            </div>
            {/* Description skeleton */}
            <Skeleton className="h-5 w-96 max-w-full mt-2" />
          </div>
        </div>
      </section>

      {/* Controls: Search and Sort */}
      <section className="px-4 lg:px-6">
        <div className="p-4 border border-border/40 bg-card/30 backdrop-blur-sm rounded-2xl flex flex-col gap-4 lg:flex-row lg:items-center max-w-7xl">
          <div className="relative flex-1 max-w-none lg:max-w-xs">
            {/* Search input skeleton */}
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="flex gap-2 justify-end w-full lg:w-auto items-center">
            {/* Sort button skeleton */}
            <Skeleton className="h-10 w-[160px] rounded-md" />
            {/* Sort order button skeleton */}
            <Skeleton className="h-10 w-10 rounded-md" />
          </div>
        </div>
      </section>

      {/* Grid Display */}
      <section className="px-4 lg:px-6">
        <div className="max-w-7xl">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="border border-border/40 bg-card/30 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <Skeleton className="h-4 w-4 rounded-sm" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                  <Skeleton className="h-5 w-6 rounded-full shrink-0" />
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <Skeleton className="h-3.5 w-8 rounded-sm" />
                  <Skeleton className="h-3.5 w-8 rounded-sm" />
                  <Skeleton className="h-3.5 w-8 rounded-sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

async function TagsContentWrapper() {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  if (!session) {
    redirect("/login")
  }
  const userId = session.user.id
  
  const [resources, notes, people] = await Promise.all([
    getResources(userId),
    getNotes(userId),
    getPeople(userId)
  ])

  return (
    <TagsContent 
      resources={resources} 
      notes={notes} 
      people={people} 
    />
  )
}

export default function TagsPage() {
  return (
    <Suspense fallback={<TagsSkeleton />}>
      <TagsContentWrapper />
    </Suspense>
  )
}

