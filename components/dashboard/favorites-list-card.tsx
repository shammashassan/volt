"use client"

import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, ExternalLink, BookmarkPlus } from "lucide-react"
import { Resource } from "@/types"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"

interface FavoritesListCardProps {
    resources: Resource[]
}

export function FavoritesListCard({ resources }: FavoritesListCardProps) {
    return (
        <Card
            id="favorites"
            className="flex h-full flex-col border-border/50 bg-card/60 p-5 shadow-sm backdrop-blur-sm"
        >
            <CardHeader className="flex flex-row items-center gap-0 p-0 pb-4">
                <div className="flex items-center gap-2 flex-1">
                    <div className="flex size-5 items-center justify-center rounded bg-purple-500/10">
                        <Star className="size-3 fill-purple-500/30 text-purple-500" />
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                        favorites &amp; pinned
                    </span>
                </div>
                {resources.length > 0 && (
                    <span className="font-mono text-[10px] text-muted-foreground/50 tabular-nums">
                        {resources.length}
                    </span>
                )}
            </CardHeader>

            <CardContent className="flex flex-1 flex-col p-0">
                {resources.length > 0 ? (
                    <ScrollArea className="h-[200px] w-full">
                        <div className="flex flex-col gap-1.5 pr-3">
                            {resources.map(res => {
                                const rawUrl = res.url || ""
                                const targetUrl = /^(https?:)?\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`
                                return (
                                    <a
                                        key={res.id || res._id?.toString()}
                                        href={targetUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group/item flex items-center justify-between rounded-md border border-border/60 bg-muted/10 p-2.5 transition-colors hover:bg-muted/40"
                                    >
                                        <div className="flex min-w-0 flex-col pr-2">
                                            <span className="truncate text-xs font-semibold text-foreground transition-colors group-hover/item:text-primary">
                                                {res.title}
                                            </span>
                                            <span className="truncate text-[10px] text-muted-foreground/60">
                                                {rawUrl}
                                            </span>
                                        </div>
                                        <ExternalLink className="size-3.5 shrink-0 text-muted-foreground/30 transition-colors group-hover/item:text-primary" />
                                    </a>
                                )
                            })}
                        </div>
                    </ScrollArea>
                ) : (
                    <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/40 bg-muted/10 py-6">
                        <div className="flex size-8 items-center justify-center rounded-full bg-purple-500/10">
                            <BookmarkPlus className="size-4 text-purple-500/60" />
                        </div>
                        <div className="flex flex-col items-center gap-0.5">
                            <p className="text-xs font-medium text-foreground">No favorites yet</p>
                            <p className="text-[10px] text-muted-foreground/60 text-center max-w-[160px]">
                                Star resources to pin them here for fast access.
                            </p>
                        </div>
                        <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2 mt-0.5" asChild>
                            <Link href="/resources">Browse resources →</Link>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}