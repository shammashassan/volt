"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp } from "lucide-react"
import { Resource } from "@/lib/types"
import { ScrollArea } from "@/components/ui/scroll-area"

interface RecentlyValuableProps {
    resources: Resource[]
}

export function RecentlyValuable({ resources }: RecentlyValuableProps) {
    return (
        <Card className="flex h-full flex-col border-border/50 bg-card/60 p-5 shadow-sm backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center gap-2 p-0 pb-4">
                <TrendingUp className="size-4 text-emerald-500" />
                <CardTitle className="text-sm font-semibold italic lowercase text-muted-foreground/90">
                    most used resources
                </CardTitle>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col justify-start p-0">
                {resources.length > 0 ? (
                    <ScrollArea className="h-[200px] w-full">
                        <div className="flex flex-col gap-2 pr-3.5">
                            {resources.map((res, idx) => {
                                const rawUrl = res.link || res.url || ""
                                const targetUrl = /^(https?:)?\/\//i.test(rawUrl)
                                    ? rawUrl
                                    : `https://${rawUrl}`
                                
                                let cleanUrl = ""
                                try {
                                    const urlObj = new URL(targetUrl)
                                    cleanUrl = urlObj.hostname.replace(/^www\./i, "")
                                } catch {
                                    cleanUrl = rawUrl.replace(/^(https?:\/\/)?(www\.)?/i, "").split("/")[0]
                                }

                                return (
                                    <a
                                        key={res.id || res._id?.toString()}
                                        href={targetUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group/item border border-border/30 bg-muted/5 p-3.5 rounded-lg flex items-center justify-between transition-all hover:border-primary/20 hover:bg-muted/40"
                                    >
                                        <div className="flex min-w-0 items-center gap-3 pr-2">
                                            <span className="shrink-0 font-mono text-xs font-bold text-muted-foreground/40">
                                                #{idx + 1}
                                            </span>
                                            <div className="flex flex-col min-w-0 gap-0.5">
                                                <span className="truncate text-sm font-medium text-foreground transition-colors group-hover/item:text-primary">
                                                    {res.name || res.title}
                                                </span>
                                                <span className="truncate text-[10px] text-muted-foreground/60">
                                                    {cleanUrl}
                                                </span>
                                            </div>
                                        </div>
                                        <Badge variant="secondary" className="shrink-0 font-mono text-[10px] tabular-nums">
                                            {res.useCount || 0} visits
                                        </Badge>
                                    </a>
                                )
                            })}
                        </div>
                    </ScrollArea>
                ) : (
                    <p className="py-8 text-center text-xs text-muted-foreground">
                        Usage history is empty. Visit links to see them here.
                    </p>
                )}
            </CardContent>
        </Card>
    )
}