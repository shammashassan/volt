import { Suspense } from "react"
import { redirect } from "next/navigation"
import { cacheLife, cacheTag } from "next/cache"
import { getSessionUser } from "@/lib/auth-utils"
import {
  getStats,
  getFavorites,
  getRecentlyViewed,
  getRecentlyAdded,
  getCategoriesWithCounts,
  getInboxCount,
  getRecentlyValuable,
  getRecommendedResources,
  getSpotlightResource,
} from "@/lib/db"
import { WorkspaceBento } from "@/components/dashboard/workspace-bento"
import { Skeleton } from "@/components/ui/skeleton"

async function WorkspaceDashboardBody({
  userId,
  userName,
}: {
  userId: string
  userName: string
}) {
  "use cache"
  cacheLife("minutes")
  cacheTag(`explore-body-${userId}`)

  const [
    stats,
    favorites,
    recentlyViewed,
    recentlyAdded,
    categories,
    inboxCount,
    recentlyValuable,
    recommended,
    spotlight,
  ] = await Promise.all([
    getStats(userId),
    getFavorites(userId),
    getRecentlyViewed(userId, 3),
    getRecentlyAdded(userId, 4),
    getCategoriesWithCounts(userId),
    getInboxCount(userId),
    getRecentlyValuable(userId, 5),
    getRecommendedResources(userId, 3),
    getSpotlightResource(userId),
  ])

  return (
    <WorkspaceBento
      userName={userName}
      resourcesCount={stats.resources}
      categoriesCount={stats.categories}
      favoritesCount={favorites.resources.length}
      recentlyViewed={recentlyViewed}
      recommended={recommended}
      recentlyValuable={recentlyValuable}
      inboxCount={inboxCount}
      favorites={favorites.resources}
      spotlight={spotlight}
      recentlyAdded={recentlyAdded}
      categories={categories}
    />
  )
}

/**
 * WorkspaceSkeleton mirrors the 4-row bento layout exactly so the Suspense
 * fallback feels native rather than generic.
 *
 * Uses <Skeleton> throughout — no bare animate-pulse divs.
 */
function WorkspaceSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 lg:px-6">
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-border pb-6">
        <Skeleton className="h-3 w-28 rounded" />
        <Skeleton className="h-8 w-64 rounded-md" />
      </div>

      {/* Grid Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Row 1: Command Center & Quick Save */}
        <Skeleton className="h-28 rounded-xl lg:col-span-2 order-1 lg:order-0" />
        <Skeleton className="h-24 rounded-xl lg:col-span-1 order-2 lg:order-0" />

        {/* Row 2: Workspace Activity & Workspace Health */}
        <Skeleton className="h-64 rounded-xl lg:col-span-2 order-3 lg:order-0" />
        <Skeleton className="h-[210px] rounded-xl lg:col-span-1 order-5 lg:order-0" />

        {/* Row 3: Recently Added & Categories Summary */}
        <div className="lg:col-span-2 order-4 lg:order-0 flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-7 w-20 rounded" />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Skeleton className="h-[102px] rounded-xl" />
            <Skeleton className="h-[102px] rounded-xl" />
            <Skeleton className="h-[102px] rounded-xl" />
            <Skeleton className="h-[102px] rounded-xl" />
          </div>
        </div>
        <Skeleton className="h-[288px] rounded-xl lg:col-span-1 order-6 lg:order-0" />

        {/* Row 4: Most Used Resources & Favorites */}
        <Skeleton className="h-[270px] rounded-xl lg:col-span-2 order-7 lg:order-0" />
        <Skeleton className="h-[270px] rounded-xl lg:col-span-1 order-8 lg:order-0" />
      </div>
    </div>
  )
}

export default async function ExplorePage() {
  let user: { id: string; name?: string | null }
  try {
    user = await getSessionUser()
  } catch {
    redirect("/login")
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-6 pb-12">
      <Suspense fallback={<WorkspaceSkeleton />}>
        <WorkspaceDashboardBody
          userId={user.id}
          userName={user.name || "Developer"}
        />
      </Suspense>
    </div>
  )
}