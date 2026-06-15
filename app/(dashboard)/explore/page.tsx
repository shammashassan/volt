import * as React from "react"
import { Suspense } from "react"
import { redirect } from "next/navigation"
import { cacheLife, cacheTag } from "next/cache"
import { getSessionUser } from "@/lib/auth-utils"
import { getStats, getFavorites, getRecentlyViewed, getRecentlyAdded, getMostUsed, getCategoriesWithCounts } from "@/lib/db"
import { DashboardStats } from "@/components/dashboard-stats"
import { CategoryExplorer } from "@/components/category-explorer"
import { ResourceCard } from "@/components/resource-card"
import { Separator } from "@/components/ui/separator"
import { SearchCTAButton } from "@/components/search-cta-button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  SparklesIcon,
  StarIcon,
  ClockIcon,
  FlameIcon,
  LayersIcon,
  PlusIcon,
  ArrowRightIcon,
  FileTextIcon,
  FolderOpenIcon,
  LinkIcon,
  UsersIcon,
  ExternalLinkIcon,
  TrendingUpIcon,
} from "lucide-react"
import Link from "next/link"
import { Resource, Note } from "@/lib/types"
import { Resource as DataResource } from "@/lib/data"
import { ExploreMobileTabs } from "./explore-mobile-tabs"

// ─── Cached Data Components ──────────────────────────────────────────────────

async function ExploreDashboardBody({ userId }: { userId: string }) {
  "use cache"
  cacheLife("minutes")
  cacheTag(`explore-body-${userId}`)

  const [stats, favorites, recentlyViewed, recentlyAdded, mostUsed, categories] =
    await Promise.all([
      getStats(userId),
      getFavorites(userId),
      getRecentlyViewed(userId, 4),
      getRecentlyAdded(userId, 6),
      getMostUsed(userId, 6),
      getCategoriesWithCounts(userId),
    ])

  const isEmpty =
    stats.resources === 0 &&
    stats.categories === 0 &&
    stats.notes === 0 &&
    stats.projects === 0 &&
    stats.people === 0

  if (isEmpty) {
    return (
      <section className="px-4 lg:px-6 max-w-4xl mx-auto w-full py-12">
        <Card className="border-dashed">
          <CardHeader className="items-center text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
              <LayersIcon className="size-7 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl">Initialize your workspace</CardTitle>
            <CardDescription className="max-w-sm">
              Volt is empty. Create structural entities to start organizing your
              developer stack, resources, and connections.
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-3 sm:grid-cols-2 max-w-xl mx-auto">
            {[
              {
                icon: FolderOpenIcon,
                num: "01",
                title: "Setup Categories",
                desc: "Categories define the root layout of your sidebar and folder scopes.",
              },
              {
                icon: LinkIcon,
                num: "02",
                title: "Capture Resources",
                desc: "Save references, repositories, or websites and tag or categorize them.",
              },
              {
                icon: FileTextIcon,
                num: "03",
                title: "Link Knowledge Notes",
                desc: "Draft split-pane notes, pin them, and build bidirectional relationships.",
              },
              {
                icon: UsersIcon,
                num: "04",
                title: "Track Projects & Contacts",
                desc: "Link contacts and design files together under custom project streams.",
              },
            ].map((item) => (
              <Card key={item.num}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <item.icon className="size-4 text-muted-foreground" />
                    <span className="text-muted-foreground font-mono text-xs">{item.num}</span>
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </CardContent>

          <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
              Press{" "}
              <kbd className="bg-muted px-1.5 py-0.5 rounded border text-xs font-mono">
                Ctrl + K
              </kbd>{" "}
              to open create actions
            </p>
          </CardFooter>
        </Card>
      </section>
    )
  }

  return (
    <div className="flex flex-col gap-10">

      {/* Categories */}
      <section className="flex flex-col gap-4">
        <div className="px-4 lg:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayersIcon className="size-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Structural Categories</h2>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/categories">
              Manage
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
          </Button>
        </div>
        <div className="px-4 lg:px-6">
          <CategoryExplorer initialCategories={categories} />
        </div>
      </section>

      <Separator className="mx-4 lg:mx-6" />

      {/* Favorites */}
      <section className="px-4 lg:px-6 flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <StarIcon className="size-4 text-amber-500 fill-amber-500" />
            <h2 className="text-sm font-semibold">Favorites &amp; Starred</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(favorites.resources as unknown as Resource[]).map(
              (resource: Resource, index: number) => (
                <ResourceCard
                  key={resource.id || resource._id?.toString()}
                  resource={resource as unknown as DataResource}
                  priority={index < 3}
                />
              )
            )}

            {(favorites.notes as unknown as Note[]).map((note: Note) => (
              <Link
                href="/notes"
                key={note.id || note._id?.toString()}
                className="block group"
              >
                <Card className="h-full hover:bg-accent/50 transition-colors">
                  <CardHeader className="pb-2">
                    <CardAction>
                      <span className="text-xs text-muted-foreground font-mono">
                        {note.updatedAt
                          ? new Date(note.updatedAt).toLocaleDateString()
                          : new Date().toLocaleDateString()}
                      </span>
                    </CardAction>
                    <CardDescription className="flex items-center gap-1">
                      <FileTextIcon className="size-3" />
                      Pinned Note
                    </CardDescription>
                    <CardTitle className="text-base line-clamp-1 group-hover:text-primary transition-colors">
                      {note.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {note.content}
                    </p>
                  </CardContent>
                  {(note.tags || []).length > 0 && (
                    <CardFooter className="flex flex-wrap gap-1 pt-0">
                      {(note.tags || []).slice(0, 3).map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </CardFooter>
                  )}
                </Card>
              </Link>
            ))}

            {favorites.resources.length === 0 && favorites.notes.length === 0 && (
              <Alert className="sm:col-span-2 lg:col-span-3">
                <StarIcon />
                <AlertTitle>Nothing starred yet</AlertTitle>
                <AlertDescription>
                  Star resources or pin notes to see them here.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </section>

      <Separator className="mx-4 lg:mx-6" />

      {/* Mobile tabs: Added / Viewed / Most Used */}
      <ExploreMobileTabs
        recentlyAdded={recentlyAdded as unknown as Resource[]}
        recentlyViewed={recentlyViewed as unknown as Resource[]}
        mostUsed={mostUsed as unknown as Resource[]}
      />

      {/* Desktop: Recently Viewed (2/3) + Most Used (1/3), then Recently Added */}
      <div className="hidden lg:flex flex-col gap-10">
        <section className="px-4 lg:px-6 grid gap-6 lg:grid-cols-3">

          {/* Recently Viewed — 2/3 */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <ClockIcon className="size-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Recently Viewed</h2>
            </div>
            {recentlyViewed.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {(recentlyViewed as unknown as Resource[]).map((resource: Resource, index: number) => (
                  <ResourceCard
                    key={resource.id || resource._id?.toString()}
                    resource={resource as unknown as DataResource}
                    priority={index < 4}
                  />
                ))}
              </div>
            ) : (
              <Alert>
                <ClockIcon />
                <AlertTitle>Nothing viewed yet</AlertTitle>
                <AlertDescription>
                  Resources you open will appear here.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Most Used — 1/3 */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <FlameIcon className="size-4 text-destructive" />
              <h2 className="text-sm font-semibold">Most Used</h2>
            </div>
            <Card className="flex-1">
              <CardHeader>
                <CardTitle className="text-sm">Top Resources</CardTitle>
                <CardDescription>Ranked by link clicks</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-1 pt-0">
                {(mostUsed as unknown as Resource[]).map((res: Resource, idx: number) => (
                  <a
                    key={res.id || res._id?.toString()}
                    href={res.url || res.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2 rounded-md hover:bg-accent transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-mono text-muted-foreground w-5 shrink-0 tabular-nums">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <span className="text-sm truncate group-hover:text-primary transition-colors">
                        {res.title || res.name}
                      </span>
                    </div>
                    <Badge variant="secondary" className="shrink-0 ml-2 tabular-nums">
                      {res.useCount}
                    </Badge>
                  </a>
                ))}
                {mostUsed.length === 0 && (
                  <Alert>
                    <TrendingUpIcon />
                    <AlertTitle>No activity yet</AlertTitle>
                    <AlertDescription>
                      Usage increments on link clicks.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator className="mx-4 lg:mx-6" />

        <section className="flex flex-col gap-4">
          <div className="px-4 lg:px-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PlusIcon className="size-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Recently Added</h2>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/resources">
                Explore All
                <ArrowRightIcon data-icon="inline-end" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 px-4 lg:px-6">
            {(recentlyAdded as unknown as Resource[]).map((resource: Resource, index: number) => (
              <ResourceCard
                key={resource.id || resource._id?.toString()}
                resource={resource as unknown as DataResource}
                priority={index < 3}
              />
            ))}
          </div>
        </section>
      </div>

    </div>
  )
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function ExploreHeroSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-4 py-6 lg:px-6 lg:py-8 border-b bg-linear-to-t from-primary/5 to-card">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex flex-col gap-3 max-w-2xl w-full">
          <Badge variant="outline" className="w-fit gap-1.5 opacity-50">
            <SparklesIcon className="size-3 animate-pulse text-muted-foreground" />
            Volt Personal OS v2
          </Badge>
          <div className="flex flex-col gap-2 w-full">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-semibold md:text-3xl">Welcome back,</span>
              <Skeleton className="h-8 w-32 rounded-md" />
            </div>
            <div className="space-y-2 mt-1">
              <Skeleton className="h-4 w-full max-w-md rounded-md" />
              <Skeleton className="h-4 w-3/4 max-w-sm rounded-md" />
            </div>
          </div>
        </div>
        <div className="shrink-0">
          <SearchCTAButton />
        </div>
      </div>
    </div>
  )
}

function ExploreStatsSkeleton() {
  return (
    <div className="grid gap-4 grid-cols-1 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-[104px] rounded-xl" />
      ))}
    </div>
  )
}

function ExploreSkeleton() {
  return (
    <div className="flex flex-col gap-8 px-4 lg:px-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

// ─── Async Wrappers ───────────────────────────────────────────────────────────

async function ExploreHeroWrapper() {
  let user: { id: string; name?: string | null }
  try {
    user = await getSessionUser()
  } catch {
    redirect("/login")
  }

  return (
    <div className="flex flex-col gap-4 px-4 py-6 lg:px-6 lg:py-8 border-b bg-linear-to-t from-primary/5 to-card">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex flex-col gap-3 max-w-2xl">
          <Badge variant="outline" className="w-fit gap-1.5">
            <SparklesIcon className="size-3" />
            Volt Personal OS v2
          </Badge>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold md:text-3xl">
              Welcome back,{" "}
              <span className="text-primary">{user.name || "Developer"}</span>
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
              Your personalized, text-indexed operating system. Capture web
              resources, write markdown notes, track projects, and link
              relationships in a unified workspace.
            </p>
          </div>
        </div>
        <div className="shrink-0">
          <SearchCTAButton />
        </div>
      </div>
    </div>
  )
}

async function ExploreStatsWrapper() {
  let user: { id: string; name?: string | null }
  try {
    user = await getSessionUser()
  } catch {
    redirect("/login")
  }

  return <DashboardStats userId={user.id} />
}

async function ExploreBodyWrapper() {
  let user: { id: string; name?: string | null }
  try {
    user = await getSessionUser()
  } catch {
    redirect("/login")
  }

  return <ExploreDashboardBody userId={user.id} />
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ExplorePage() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-6 pb-12">
      <Suspense fallback={<ExploreHeroSkeleton />}>
        <ExploreHeroWrapper />
      </Suspense>

      <section className="px-4 lg:px-6">
        <Suspense fallback={<ExploreStatsSkeleton />}>
          <ExploreStatsWrapper />
        </Suspense>
      </section>

      <Separator className="mx-4 lg:mx-6" />

      <Suspense fallback={<ExploreSkeleton />}>
        <ExploreBodyWrapper />
      </Suspense>
    </div>
  )
}