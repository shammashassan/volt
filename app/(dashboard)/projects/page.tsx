import { getProjects } from "@/lib/queries/projects";
import { ProjectsContent } from "./projects-content"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

function ProjectsSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6 pb-12">
      {/* Header skeleton */}
      <section className="px-4 pt-8 lg:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between max-w-7xl">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-40" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-6 w-96 max-w-full" />
          </div>
          <Skeleton className="h-10 w-32 shrink-0 hidden sm:block" />
        </div>
      </section>

      {/* Main content skeleton */}
      <section className="px-4 lg:px-6">
        <div className="max-w-7xl flex flex-col gap-6">
          <div className="flex gap-4 border-b border-border/20 pb-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border border-border/20 rounded-xl p-6 flex flex-col gap-4 bg-card/30 backdrop-blur-xs">
                <div className="flex items-start justify-between gap-3">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <div className="flex flex-col gap-2 mt-1.5">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <div className="pt-4 mt-auto border-t border-border/20 flex justify-between items-center">
                  <Skeleton className="h-4 w-24" />
                  <div className="flex gap-2">
                    <Skeleton className="size-7 rounded-lg" />
                    <Skeleton className="size-7 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

async function ProjectsContentWrapper() {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  if (!session) {
    redirect("/login")
  }
  const userId = session.user.id
  const projects = await getProjects(userId)
  
  return <ProjectsContent initialProjects={projects} />
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<ProjectsSkeleton />}>
      <ProjectsContentWrapper />
    </Suspense>
  )
}

