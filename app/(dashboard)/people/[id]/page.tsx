import { getPersonById, getResourcesByPersonId, getNotesByPersonId } from "@/lib/db"
import { PersonContent } from "./person-content"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect, notFound } from "next/navigation"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

function PersonDetailSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6 pb-12 animate-pulse">
      {/* Header section skeleton */}
      <section className="px-4 pt-8 lg:px-6">
        <div className="flex flex-col gap-4 max-w-7xl">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              {/* Back button skeleton */}
              <Skeleton className="h-12 w-12 rounded-xl bg-muted/30" />
              {/* Icon skeleton */}
              <Skeleton className="h-12 w-12 rounded-xl bg-muted/30" />
              {/* Name & Badge skeleton */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-48 bg-muted/30 rounded-lg" />
                <Skeleton className="h-6 w-20 rounded-full bg-muted/30" />
              </div>
            </div>
            {/* Notes/description skeleton */}
            <div className="space-y-2 mt-2 max-w-2xl">
              <Skeleton className="h-5 w-full bg-muted/30 rounded-md" />
              <Skeleton className="h-5 w-2/3 bg-muted/30 rounded-md" />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content (Tabs) skeleton */}
      <section className="px-4 lg:px-6">
        <div className="max-w-7xl flex flex-col gap-6">
          {/* Tabs header */}
          <div className="flex gap-2 max-w-[400px]">
            <Skeleton className="h-10 w-1/2 bg-muted/30 rounded-lg" />
            <Skeleton className="h-10 w-1/2 bg-muted/30 rounded-lg" />
          </div>

          {/* Grid skeleton */}
          <div className="border rounded-xl bg-card/40 backdrop-blur-sm p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-border/40 bg-card/30 rounded-xl p-4 flex flex-col gap-3 h-40">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-2/3 bg-muted/30 rounded-md" />
                  <Skeleton className="h-4 w-full bg-muted/30 rounded-md" />
                  <Skeleton className="h-4 w-full bg-muted/30 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

async function PersonDetailContentWrapper({ id }: { id: string }) {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  if (!session) {
    redirect("/login")
  }
  const userId = session.user.id
  
  const [person, linkedResources, linkedNotes] = await Promise.all([
    getPersonById(id, userId),
    getResourcesByPersonId(id, userId),
    getNotesByPersonId(id, userId)
  ])

  if (!person) {
    notFound()
  }

  return (
    <PersonContent 
      person={person} 
      resources={linkedResources} 
      notes={linkedNotes} 
    />
  )
}

export default async function PersonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  return (
    <Suspense fallback={<PersonDetailSkeleton />}>
      <PersonDetailContentWrapper id={id} />
    </Suspense>
  )
}
