"use client"

import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star, BookmarkPlus, ExternalLink } from "lucide-react"
import { Resource } from "@/types"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface FavoritesListCardProps {
    resources: Resource[]
}

export function FavoritesListCard({ resources }: FavoritesListCardProps) {
    return (
        <Card
            id="favorites"
            size="sm"
            className="flex h-full flex-col"
        >
            <CardHeader>
                <CardTitle>
                    <span className="flex items-center gap-2">
                        <Star className="size-4 fill-purple-500/30 text-purple-500" />
                        <span className="text-muted-foreground">Favorites &amp; Pinned</span>
                    </span>
                </CardTitle>
                {resources.length > 0 && (
                    <CardAction>
                        <span className="font-mono text-xs text-muted-foreground/60 tabular-nums">
                            {resources.length}
                        </span>
                    </CardAction>
                )}
            </CardHeader>

            <CardContent className="flex flex-1 flex-col">
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
                        <Button
                            variant="ghost"
                            size="xs"
                            className="mt-0.5"
                            render={<Link href="/resources" />}
                            nativeButton={false}
                        >
                            Browse resources →
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
