import { getResources } from "@/lib/queries/resources";
import { getNotes } from "@/lib/queries/notes";
import { getPeople } from "@/lib/queries/people";
import { TagsContent } from "./tags-content"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

function TagsSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6 pb-12 animate-pulse">
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

      {/* Controls & Combobox Filter Row Skeleton */}
      <section className="px-4 lg:px-6">
        <div className="p-4 border border-border/40 bg-card/30 backdrop-blur-sm rounded-2xl flex flex-col gap-4 md:flex-row md:items-center max-w-7xl">
          {/* Combobox Chips input skeleton */}
          <div className="flex-1 min-w-0">
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          {/* Sort & Order button skeletons */}
          <div className="flex gap-2 items-center shrink-0">
            <Skeleton className="h-10 w-32 rounded-lg" />
            <Skeleton className="h-10 w-10 rounded-lg" />
          </div>
        </div>
      </section>

      {/* Empty State placeholder skeleton */}
      <section className="px-4 lg:px-6">
        <div className="max-w-7xl flex flex-col items-center justify-center py-20 gap-4">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <Skeleton className="h-6 w-48 rounded" />
          <Skeleton className="h-4 w-80 rounded" />
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

