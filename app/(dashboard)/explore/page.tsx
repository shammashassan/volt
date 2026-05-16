import * as React from "react"
import { DashboardStats } from "@/components/dashboard-stats"
import { CategoryExplorer } from "@/components/category-explorer"
import { ResourceCard } from "@/components/resource-card"
import { getFeaturedResources } from "@/lib/db"
import { Separator } from "@/components/ui/separator"
import { SparklesIcon, RocketIcon } from "lucide-react"

// Remove force-dynamic to allow ISR/Static caching with revalidateTag
// export const dynamic = "force-dynamic";

export default async function ExplorePage() {
  const featuredResources = await getFeaturedResources()

  return (
    <div className="@container/main flex flex-1 flex-col gap-8 pb-12">
      {/* Hero Welcome Section */}
      <section className="px-4 py-8 lg:px-6 lg:py-12 bg-linear-to-b from-primary/5 via-transparent to-transparent">
        <div className="flex flex-col gap-2 max-w-3xl">
          <div className="flex items-center gap-2 text-primary font-bold tracking-widest uppercase text-[10px] mb-2 drop-shadow-sm">
            <SparklesIcon className="size-3" />
            Curated Knowledge Base
          </div>
          <h1 className="text-4xl font-black tracking-tight lg:text-5xl text-foreground leading-[1.1]!">
            Your <span className="italic lowercase text-primary/80">UI Development</span> <br />
            Second Brain.
          </h1>
          <p className="text-lg text-muted-foreground/80 mt-4 leading-relaxed font-medium">
            A specialized hub for frontend developers to store, organize, and quickly retrieve
            the industry's best UI tools, component libraries, and visual resources.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section>
        <DashboardStats />
      </section>

      <Separator className="mx-4 lg:mx-6 opacity-40" />

      {/* Categories Explorer Section */}
      <section className="flex flex-col gap-6">
        <div className="px-4 lg:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 bg-primary rounded-full" />
            <h2 className="text-2xl font-black tracking-tight lowercase italic">
              Explore Categories
            </h2>
          </div>
        </div>
        <CategoryExplorer />
      </section>

      <Separator className="mx-4 lg:mx-6 opacity-40" />

      {/* Featured Resources Section */}
      <section className="flex flex-col gap-6">
        <div className="px-4 lg:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 bg-amber-500 rounded-full" />
            <h2 className="text-2xl font-black tracking-tight lowercase italic">
              Featured Tools
            </h2>
          </div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-muted-foreground/40 italic">
            <RocketIcon className="size-3" />
            Handpicked
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 px-4 lg:px-6">
          {featuredResources.map((resource) => (
            <ResourceCard key={resource.name} resource={resource} />
          ))}
        </div>
      </section>
    </div>
  )
}
