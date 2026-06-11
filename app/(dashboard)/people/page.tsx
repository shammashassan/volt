import { Suspense } from "react"
import { getPeople } from "@/lib/db"
import { PeopleContent } from "./people-content"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

function PeopleSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6 pb-12">
      {/* Header section */}
      <section className="px-4 pt-8 lg:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between max-w-7xl">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-xl animate-pulse" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-32 rounded-md animate-pulse" />
                <Skeleton className="h-6 w-20 rounded-full animate-pulse" />
              </div>
            </div>
            <Skeleton className="h-5 w-[80%] max-w-md mt-2 animate-pulse" />
          </div>
          <Skeleton className="h-10 w-full sm:w-32 rounded-md shrink-0 animate-pulse" />
        </div>
      </section>

      {/* Main Content section */}
      <section className="px-4 lg:px-6">
        <div className="max-w-7xl flex flex-col gap-6">
          {/* Search Bar */}
          <div className="max-w-md w-full">
            <Skeleton className="h-9 w-full rounded-md animate-pulse" />
          </div>

          {/* People Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-border/20 p-5 bg-card/30 backdrop-blur-xs flex flex-col justify-between h-[180px]"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <Skeleton className="h-5 w-1/2 rounded animate-pulse" />
                    <Skeleton className="h-5 w-16 rounded-full animate-pulse" />
                  </div>
                  <Skeleton className="h-4 w-full rounded animate-pulse" />
                  <Skeleton className="h-4 w-[80%] rounded animate-pulse" />
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-border/10">
                  <Skeleton className="h-3 w-24 rounded animate-pulse" />
                  <div className="flex gap-2">
                    <Skeleton className="size-7 rounded-lg animate-pulse" />
                    <Skeleton className="size-7 rounded-lg animate-pulse" />
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

async function PeopleContentWrapper() {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  if (!session) {
    redirect("/login")
  }
  const userId = session.user.id
  const people = await getPeople(userId)
  
  return <PeopleContent initialPeople={people} />
}

export default function PeoplePage() {
  return (
    <Suspense fallback={<PeopleSkeleton />}>
      <PeopleContentWrapper />
    </Suspense>
  )
}
