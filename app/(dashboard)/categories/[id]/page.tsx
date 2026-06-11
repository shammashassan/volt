import { getResources, getCategoryById, getCategories } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import { FileText } from "lucide-react"
import { ICON_MAP } from "@/lib/icons"
import { CategoryActions } from "./category-actions"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

function CategorySkeleton() {
  return (
    <div className="flex flex-1 flex-col pb-12 animate-pulse">
      {/* Header section */}
      <section className="px-4 pt-8 lg:px-6">
        <div className="flex flex-wrap gap-6 items-start justify-between max-w-7xl">
          {/* Category info */}
          <div className="flex flex-col gap-2 min-w-0">
            <div className="flex items-center gap-4">
              {/* Icon skeleton */}
              <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
              <div className="flex items-center gap-2 min-w-0">
                {/* Title skeleton */}
                <Skeleton className="h-9 w-48 md:h-10 rounded" />
                {/* Badge skeleton */}
                <Skeleton className="h-6 w-20 rounded-full shrink-0" />
              </div>
            </div>
            {/* Description skeleton */}
            <Skeleton className="h-6 w-80 max-w-2xl mt-2 rounded" />
          </div>

          {/* Button skeleton */}
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <Skeleton className="h-10 w-28 rounded-md" />
            <Skeleton className="h-10 w-32 rounded-md" />
          </div>

          {/* Grid skeleton */}
          <div className="basis-full w-full mt-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-border/40 bg-card/60 overflow-hidden">
                  <Skeleton className="aspect-video w-full rounded-none" />
                  <div className="px-4 py-3 flex flex-col gap-2">
                    <Skeleton className="h-5 w-3/4 rounded" />
                    <Skeleton className="h-3.5 w-full rounded" />
                    <Skeleton className="h-3.5 w-5/6 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

interface CategoryPageContentProps {
  categoryId: string
}

async function CategoryPageContent({ categoryId }: CategoryPageContentProps) {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  if (!session) {
    redirect("/login")
  }
  const userId = session.user.id

  const [category, resources, categories] = await Promise.all([
    getCategoryById(categoryId, userId),
    getResources(userId),
    getCategories(userId)
  ])

  if (!category) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <p className="text-muted-foreground">Category not found.</p>
      </div>
    )
  }

  const user = session.user as any
  const isAdmin = user?.role === "admin"
  const categoryResources = resources.filter((r) => r.category === categoryId)
  const Icon = (category.icon && ICON_MAP[category.icon as keyof typeof ICON_MAP]) || FileText

  return (
    <div className="flex flex-1 flex-col pb-12">
      {/* Header & Content section */}
      <section className="px-4 pt-8 lg:px-6">
        <div className="flex flex-wrap gap-6 items-start justify-between max-w-7xl">
          {/* Category info */}
          <div className="flex flex-col gap-2 min-w-0">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-6" />
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <h1 className="text-3xl font-black tracking-tight md:text-4xl bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/60">
                  {category.title}
                </h1>
                <Badge variant="outline" className="h-6 shrink-0 rounded-full border-primary/20 bg-primary/5 text-primary text-[10px] uppercase font-bold tracking-widest px-2.5">
                  {categoryResources.length} <span className="hidden sm:inline ml-1">Resources</span>
                </Badge>
              </div>
            </div>
            {category.description && (
              <p className="text-lg text-muted-foreground/80 max-w-2xl font-medium mt-2">
                {category.description}
              </p>
            )}
          </div>

          {/* Client component — owns buttons + grid */}
          <CategoryActions
            categoryId={categoryId}
            categories={categories}
            resources={categoryResources}
            isAdmin={isAdmin}
          />
        </div>
      </section>
    </div>
  )
}

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: categoryId } = await params

  return (
    <Suspense fallback={<CategorySkeleton />}>
      <CategoryPageContent categoryId={categoryId} />
    </Suspense>
  )
}
