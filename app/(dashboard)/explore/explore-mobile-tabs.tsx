"use client"

import { useState } from "react"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { ResourceCard } from "@/components/resources/resource-card"
import { Button } from "@/components/ui/button"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowRightIcon, TrendingUpIcon } from "lucide-react"
import { Resource } from "@/types"


interface ExploreMobileTabsProps {
  recentlyAdded: Resource[]
  recentlyViewed: Resource[]
  mostUsed: Resource[]
}

export function ExploreMobileTabs({
  recentlyAdded,
  recentlyViewed,
  mostUsed,
}: ExploreMobileTabsProps) {
  const [activeTab, setActiveTab] = useState("added")

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4 lg:px-6 flex flex-col gap-4 lg:hidden">
      <div className="flex items-center justify-between gap-4">
        {/* Dropdown Select for Mobile Screen Tab Filtering */}
        <div className="flex-1 max-w-[240px]">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-full h-10 font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="added">Recently Added</SelectItem>
              {recentlyViewed.length > 0 && (
                <SelectItem value="viewed">Recently Viewed</SelectItem>
              )}
              <SelectItem value="used">Most Used</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button variant="ghost" size="sm" asChild className="shrink-0 font-bold">
          <Link href="/resources">
            All <ArrowRightIcon data-icon="inline-end" className="size-4 ml-1" />
          </Link>
        </Button>
      </div>

      <TabsContent value="added" className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-0">
        {recentlyAdded.map((resource: Resource) => (
          <ResourceCard
            key={resource.id || resource._id?.toString()}
            resource={resource}
          />
        ))}
      </TabsContent>

      {recentlyViewed.length > 0 && (
        <TabsContent value="viewed" className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-0">
          {recentlyViewed.map((resource: Resource) => (
            <ResourceCard
              key={resource.id || resource._id?.toString()}
              resource={resource}
            />
          ))}
        </TabsContent>
      )}

      <TabsContent value="used" className="mt-0">
        <Card className="border-none shadow-xl bg-background/40 backdrop-blur-md">
          <CardContent className="flex flex-col gap-1 pt-4">
            {mostUsed.map((res: Resource, idx: number) => (
              <a
                key={res.id || res._id?.toString()}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2 rounded-md hover:bg-accent transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-mono text-muted-foreground w-5 shrink-0 tabular-nums">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm truncate group-hover:text-primary transition-colors">
                    {res.title}
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
      </TabsContent>
    </Tabs>
  )
}
