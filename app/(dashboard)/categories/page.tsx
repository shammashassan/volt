import { getCategories } from "@/lib/queries/categories";
import { CategoriesContent } from "./categories-content"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Category } from "@/types"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

function CategoriesSkeleton() {
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
            <Skeleton className="h-5 w-80 max-w-full mt-2" />
          </div>
          {/* Button skeleton */}
          <Skeleton className="h-10 w-full sm:w-32 shrink-0" />
        </div>
      </section>

      {/* Main Content section (Table Skeleton) */}
      <section className="px-4 lg:px-6">
        <div className="max-w-7xl flex flex-col gap-4">
          {/* Search bar and control skeletons */}
          <div className="flex items-center justify-between gap-4 py-4">
            <Skeleton className="h-10 w-full max-w-sm rounded-md" />
            <Skeleton className="h-10 w-[120px] rounded-md" />
          </div>
          {/* Table skeleton */}
          <div className="rounded-md border border-border/40">
            <div className="h-10 border-b border-border/40 bg-muted/40 flex items-center px-4">
              <Skeleton className="h-4 w-full" />
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 border-b border-border/40 flex items-center px-4 gap-4">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/8" />
                <Skeleton className="h-4 w-12 ml-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

async function CategoriesContentWrapper() {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  if (!session) {
    redirect("/login")
  }
  const userId = session.user.id
  const categories = await getCategories(userId)
  
  return <CategoriesContent initialCategories={categories as unknown as Category[]} />
}

export default function CategoriesPage() {
  return (
    <Suspense fallback={<CategoriesSkeleton />}>
      <CategoriesContentWrapper />
    </Suspense>
  )
}

