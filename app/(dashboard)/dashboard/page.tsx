import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { cacheLife, cacheTag } from "next/cache"
import { getSessionUser } from "@/lib/auth-utils"
import { getDb } from "@/lib/db"
import { getStats, getFavorites } from "@/lib/queries/dashboard"
import { getCategoriesWithCounts } from "@/lib/queries/categories"
import {
  getRecentlyViewed,
  getRecentlyAdded,
  getInboxCount,
  getRecentlyValuable,
  getRecommendedResources,
  getSpotlightResource
} from "@/lib/queries/resources"
import { WorkspaceBento } from "@/components/dashboard/workspace-bento"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Workspace overview, recently added resources, and knowledge activity.",
}

async function getUnreadNotificationsCount(userId: string) {
  const db = await getDb()
  return db.collection("notifications").countDocuments({
    userId,
    readAt: { $exists: false },
    dismissedAt: { $exists: false },
    deletedAt: { $exists: false },
  })
}

async function getPendingRemindersCount(userId: string) {
  const db = await getDb()
  return db.collection("reminders").countDocuments({
    userId,
    status: "pending",
    deletedAt: { $exists: false },
  })
}

async function getUpcomingReleasesCount(userId: string) {
  const db = await getDb()
  const now = new Date()
  const nowStr = now.toISOString().split("T")[0]
  return db.collection("watchlist").countDocuments({
    userId,
    deletedAt: { $exists: false },
    $or: [
      {
        type: 'movie',
        status: 'planned',
        'metadata.releaseDate': { $gt: nowStr }
      },
      {
        type: { $in: ['series', 'anime'] },
        status: 'watching',
        'metadata.nextEpisodeDate': { $gt: nowStr }
      }
    ]
  })
}

async function WorkspaceDashboardBody({
  userId,
  userName,
}: {
  userId: string
  userName: string
}) {
  "use cache"
  cacheLife("minutes")
  cacheTag(`dashboard-body-${userId}`)

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
    unreadNotifications,
    remindersCount,
    releasesCount,
  ] = await Promise.all([
    getStats(userId),
    getFavorites(userId),
    getRecentlyViewed(userId, 3),
    getRecentlyAdded(userId, 10),
    getCategoriesWithCounts(userId),
    getInboxCount(userId),
    getRecentlyValuable(userId, 10),
    getRecommendedResources(userId, 3),
    getSpotlightResource(userId),
    getUnreadNotificationsCount(userId),
    getPendingRemindersCount(userId),
    getUpcomingReleasesCount(userId),
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
      unreadNotifications={unreadNotifications}
      remindersCount={remindersCount}
      releasesCount={releasesCount}
    />
  )
}

export default async function DashboardPage() {
  let user: { id: string; name?: string | null }
  try {
    user = await getSessionUser()
  } catch {
    redirect("/login")
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-6 pb-2">
      <WorkspaceDashboardBody
        userId={user.id}
        userName={user.name || "Developer"}
      />
    </div>
  )
}
