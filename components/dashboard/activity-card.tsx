"use client"

import { useState } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Clock, Sparkles, Award, ExternalLink, ArrowUpRight } from "lucide-react"
import { Resource } from "@/lib/types"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ActivityCardProps {
    recentlyViewed: Resource[]
    recommended: Resource[]
    spotlight: Resource | null
}

function ResourceLink({ resource }: { resource: Resource }) {
    const rawUrl = resource.link || resource.url || ""
    const targetUrl = /^(https?:)?\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`

    return (
        <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group/item flex items-center justify-between rounded-md border border-border bg-muted/20 p-2.5 transition-colors hover:bg-muted/60 hover:text-primary"
        >
            <div className="flex min-w-0 flex-col pr-2">
                <span className="truncate text-sm font-semibold text-foreground transition-colors group-hover/item:text-primary">
                    {resource.name || resource.title}
                </span>
                <span className="truncate text-[10px] text-muted-foreground">
                    {resource.description || rawUrl}
                </span>
            </div>
            <ExternalLink className="size-3.5 shrink-0 text-muted-foreground/50 transition-colors group-hover/item:text-primary" />
        </a>
    )
}

function EmptyState({ message }: { message: string }) {
    return (
        <p className="py-8 text-center text-xs text-muted-foreground">{message}</p>
    )
}

export function ActivityCard({ recentlyViewed, recommended, spotlight }: ActivityCardProps) {
    const hasSpotlight = spotlight !== null
    const defaultTab = recentlyViewed.length > 0 ? "recent" : "discover"

    const [tab, setTab] = useState(defaultTab)

    const spotlightUrl = spotlight
        ? /^(https?:)?\/\//i.test(spotlight.link || spotlight.url || "")
            ? spotlight.link || spotlight.url || ""
            : `https://${spotlight.link || spotlight.url || ""}`
        : ""

    return (
        <Card className="flex h-full flex-col border-border/50 bg-card/60 p-5 shadow-sm backdrop-blur-sm">
            <Tabs value={tab} onValueChange={setTab} className="flex flex-1 flex-col gap-0">
                <CardHeader className="p-0 pb-4">
                    <div className="flex items-center justify-between">
                        <TabsList className="h-8 gap-0.5 bg-muted/50 p-0.5">
                            <TabsTrigger value="recent" className="h-7 gap-1.5 px-2.5 text-xs">
                                <Clock className="size-3" />
                                Recent
                            </TabsTrigger>
                            <TabsTrigger value="discover" className="h-7 gap-1.5 px-2.5 text-xs">
                                <Sparkles className="size-3" />
                                Discover
                            </TabsTrigger>
                        </TabsList>
                    </div>
                </CardHeader>

                <CardContent className="flex-1 p-0">
                    <TabsContent value="recent" className="mt-0 flex flex-col gap-2 data-[state=active]:flex">
                        <ScrollArea className="h-[200px] w-full">
                            <div className="flex flex-col gap-2 pr-3.5">
                                {recentlyViewed.length > 0 ? (
                                    recentlyViewed.map((res) => (
                                        <ResourceLink key={res.id || res._id?.toString()} resource={res} />
                                    ))
                                ) : (
                                    <EmptyState message="No recent activity. Explore your stack to see items here." />
                                )}
                            </div>
                        </ScrollArea>
                    </TabsContent>

                    <TabsContent value="discover" className="mt-0 flex flex-col gap-2 data-[state=active]:flex">
                        <ScrollArea className="h-[200px] w-full">
                            <div className="flex flex-col gap-2 pr-3.5">
                                {hasSpotlight && spotlight && (
                                    <div className="flex flex-col gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3.5 shadow-sm transition-all hover:bg-amber-500/10">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                <Award className="size-3.5 text-amber-500 animate-[pulse_3s_ease-in-out_infinite]" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
                                                    Featured Spotlight
                                                </span>
                                            </div>
                                            <a
                                                href={spotlightUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group/spot inline-flex items-center gap-1 text-xs font-semibold text-amber-500 hover:underline"
                                            >
                                                <span>Open</span>
                                                <ArrowUpRight className="size-3 transition-transform group-hover/spot:-translate-y-0.5 group-hover/spot:translate-x-0.5" />
                                            </a>
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <h4 className="text-sm font-bold leading-snug text-foreground">
                                                {spotlight.name || spotlight.title}
                                            </h4>
                                            {spotlight.description && (
                                                <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                                                    {spotlight.description}
                                                </p>
                                            )}
                                        </div>

                                        {(spotlight.tags || []).length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                                {(spotlight.tags || []).slice(0, 3).map((t: string) => (
                                                    <Badge key={t} variant="secondary" className="text-[9px] px-1.5 py-0.5 lowercase bg-background/50 border border-amber-500/10">
                                                        #{t}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {recommended.length > 0 ? (
                                    recommended.map((res) => (
                                        <ResourceLink key={res.id || res._id?.toString()} resource={res} />
                                    ))
                                ) : (
                                    <EmptyState message="Add more resources to populate recommendations." />
                                )}
                            </div>
                        </ScrollArea>
                    </TabsContent>
                </CardContent>
            </Tabs>
        </Card>
    )
}