import { getResources } from "@/lib/queries/resources";
import { getCategories } from "@/lib/queries/categories";
import { getProjects } from "@/lib/queries/projects";
import { getPeople } from "@/lib/queries/people";
import { ResourcesContent } from "./resources-content"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Resource, Category, Project, Person } from "@/types"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

function ResourcesSkeleton() {
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
                <Skeleton className="h-9 w-48 md:h-10" />
                {/* Badge skeleton */}
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
            {/* Description skeleton */}
            <Skeleton className="h-5 w-96 max-w-full mt-2" />
          </div>
          {/* Button skeleton */}
          <Skeleton className="h-10 w-full sm:w-32 shrink-0" />
        </div>
      </section>

      {/* Filter and search bar */}
      <section className="px-4 lg:px-6">
        <div className="p-4 border border-border/40 bg-card/30 backdrop-blur-sm rounded-2xl flex flex-col gap-4 lg:flex-row lg:items-center max-w-7xl">
          <div className="relative flex-1">
            {/* Search input skeleton */}
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            {/* Select dropdown skeletons */}
            <Skeleton className="h-10 w-[140px] rounded-md" />
            <Skeleton className="h-10 w-[140px] rounded-md" />
            <Skeleton className="h-10 w-[160px] rounded-md" />
            {/* Star toggle skeleton */}
            <Skeleton className="h-10 w-[90px] rounded-md" />
          </div>
        </div>
      </section>

      {/* Grid Display */}
      <section className="px-4 lg:px-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border border-border/40 bg-card/60 rounded-xl overflow-hidden">
              {/* Image preview skeleton */}
              <Skeleton className="aspect-video w-full rounded-none" />
              {/* Content area */}
              <div className="px-4 py-3 flex flex-col gap-2">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

async function ResourcesContentWrapper() {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  if (!session) {
    redirect("/login")
  }
  const userId = session.user.id

  const [resources, categories, projects, people] = await Promise.all([
    getResources(userId),
    getCategories(userId),
    getProjects(userId),
    getPeople(userId)
  ])

  return (
    <ResourcesContent
      initialResources={resources as unknown as Resource[]}
      categories={categories as unknown as Category[]}
      projects={projects as unknown as Project[]}
      people={people as unknown as Person[]}
    />
  )
}

export default function ResourcesPage() {
  return (
    <Suspense fallback={<ResourcesSkeleton />}>
      <ResourcesContentWrapper />
    </Suspense>
  )
}

