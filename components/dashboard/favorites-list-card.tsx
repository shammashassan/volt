"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Star, ExternalLink } from "lucide-react"
import { Resource } from "@/lib/types"
import { ScrollArea } from "@/components/ui/scroll-area"

interface FavoritesListCardProps {
    resources: Resource[]
}

export function FavoritesListCard({ resources }: FavoritesListCardProps) {
    return (
        <Card
            id="favorites"
            className="flex h-full flex-col border-border/50 bg-card/60 p-5 shadow-sm backdrop-blur-sm"
        >
            <CardHeader className="flex flex-row items-center gap-2 p-0 pb-4">
                <Star className="size-4 fill-purple-400/20 text-purple-400" />
                <CardTitle className="text-sm font-semibold italic lowercase text-muted-foreground/90">
                    favorites &amp; pinned
                </CardTitle>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col justify-start p-0">
                {resources.length > 0 ? (
                    <ScrollArea className="h-[200px] w-full">
                        <div className="flex flex-col gap-2 pr-3.5">
                            {resources.map((res) => {
                                const rawUrl = res.link || res.url || ""
                                const targetUrl = /^(https?:)?\/\//i.test(rawUrl)
                                    ? rawUrl
                                    : `https://${rawUrl}`
                                return (
                                    <a
                                        key={res.id || res._id?.toString()}
                                        href={targetUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group/item flex items-center justify-between rounded-md border border-border bg-muted/20 p-2.5 transition-colors hover:bg-muted/60"
                                    >
                                        <div className="flex min-w-0 flex-col pr-2">
                                            <span className="truncate text-sm font-semibold text-foreground transition-colors group-hover/item:text-primary">
                                                {res.name || res.title}
                                            </span>
                                            <span className="truncate text-[10px] text-muted-foreground">
                                                {rawUrl}
                                            </span>
                                        </div>
                                        <ExternalLink className="size-3.5 shrink-0 text-muted-foreground/50 transition-colors group-hover/item:text-primary" />
                                    </a>
                                )
                            })}
                        </div>
                    </ScrollArea>
                ) : (
                    <p className="py-8 text-center text-xs text-muted-foreground">
                        No favorites yet. Pin your favorite resources for faster access.
                    </p>
                )}
            </CardContent>
        </Card>
    )
}