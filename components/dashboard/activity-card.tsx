"use client"

import { useState } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Sparkles, Award, ExternalLink, ArrowUpRight, MousePointerClick, BookOpen } from "lucide-react"
import { Resource } from "@/lib/types"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"

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
            className="group/item flex items-center justify-between rounded-md border border-border/60 bg-muted/10 p-2.5 transition-colors hover:bg-muted/40"
        >
            <div className="flex min-w-0 flex-col pr-2">
                <span className="truncate text-xs font-semibold text-foreground transition-colors group-hover/item:text-primary">
                    {resource.name || resource.title}
                </span>
                <span className="truncate text-[10px] text-muted-foreground/70">
                    {resource.description || rawUrl}
                </span>
            </div>
            <ExternalLink className="size-3.5 shrink-0 text-muted-foreground/30 transition-colors group-hover/item:text-primary" />
        </a>
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
                        {/* Section label */}
                        <div className="flex items-center gap-2">
                            <div className="flex size-5 items-center justify-center rounded bg-primary/10">
                                <Clock className="size-3 text-primary" />
                            </div>
                            <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                                activity
                            </span>
                        </div>
                        {/* Tab switcher */}
                        <TabsList className="h-7 gap-0.5 bg-muted/50 p-0.5">
                            <TabsTrigger value="recent" className="h-6 gap-1 px-2 text-[10px]">
                                <Clock className="size-2.5" />
                                Recent
                            </TabsTrigger>
                            <TabsTrigger value="discover" className="h-6 gap-1 px-2 text-[10px]">
                                <Sparkles className="size-2.5" />
                                Discover
                            </TabsTrigger>
                        </TabsList>
                    </div>
                </CardHeader>

                <CardContent className="flex-1 p-0">
                    {/* Recent tab */}
                    <TabsContent value="recent" className="mt-0 data-[state=active]:flex flex-col gap-2">
                        <ScrollArea className="h-[190px] w-full">
                            <div className="flex flex-col gap-1.5 pr-3">
                                {recentlyViewed.length > 0 ? (
                                    recentlyViewed.map(res => (
                                        <ResourceLink key={res.id || res._id?.toString()} resource={res} />
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/40 bg-muted/10 py-8 mt-1">
                                        <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                                            <MousePointerClick className="size-4 text-primary/60" />
                                        </div>
                                        <div className="flex flex-col items-center gap-0.5">
                                            <p className="text-xs font-medium text-foreground">No recent activity</p>
                                            <p className="text-[10px] text-muted-foreground/60 text-center max-w-[160px]">
                                                Resources you open will appear here.
                                            </p>
                                        </div>
                                        <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" asChild>
                                            <Link href="/resources">Browse your stack →</Link>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </TabsContent>

                    {/* Discover tab */}
                    <TabsContent value="discover" className="mt-0 data-[state=active]:flex flex-col gap-2">
                        <ScrollArea className="h-[190px] w-full">
                            <div className="flex flex-col gap-1.5 pr-3">
                                {/* Spotlight */}
                                {hasSpotlight && spotlight && (
                                    <div className="flex flex-col gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 transition-all hover:bg-amber-500/10">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                <Award className="size-3 text-amber-500 animate-[pulse_3s_ease-in-out_infinite]" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
                                                    Spotlight
                                                </span>
                                            </div>
                                            <a
                                                href={spotlightUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group/spot inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-500 hover:underline"
                                            >
                                                Open
                                                <ArrowUpRight className="size-3 transition-transform group-hover/spot:-translate-y-0.5 group-hover/spot:translate-x-0.5" />
                                            </a>
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <p className="text-xs font-bold leading-snug text-foreground">
                                                {spotlight.name || spotlight.title}
                                            </p>
                                            {spotlight.description && (
                                                <p className="line-clamp-2 text-[10px] leading-relaxed text-muted-foreground">
                                                    {spotlight.description}
                                                </p>
                                            )}
                                        </div>
                                        {(spotlight.tags || []).length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                                {(spotlight.tags || []).slice(0, 3).map((t: string) => (
                                                    <Badge key={t} variant="secondary" className="text-[9px] px-1.5 py-0 lowercase bg-background/50 border border-amber-500/10">
                                                        #{t}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {recommended.length > 0 ? (
                                    recommended.map(res => (
                                        <ResourceLink key={res.id || res._id?.toString()} resource={res} />
                                    ))
                                ) : !hasSpotlight ? (
                                    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/40 bg-muted/10 py-8 mt-1">
                                        <div className="flex size-8 items-center justify-center rounded-full bg-amber-500/10">
                                            <BookOpen className="size-4 text-amber-500/60" />
                                        </div>
                                        <div className="flex flex-col items-center gap-0.5">
                                            <p className="text-xs font-medium text-foreground">Nothing to discover yet</p>
                                            <p className="text-[10px] text-muted-foreground/60 text-center max-w-[160px]">
                                                Add more resources to get recommendations.
                                            </p>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        </ScrollArea>
                    </TabsContent>
                </CardContent>
            </Tabs>
        </Card>
    )
}