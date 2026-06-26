"use client"

import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, MousePointerClick } from "lucide-react"
import { Resource } from "@/lib/types"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface MostUsedCardProps {
    resources: Resource[]
}

export function MostUsedCard({ resources }: MostUsedCardProps) {
    return (
        <Card className="flex h-full flex-col border-border/50 bg-card/60 p-5 shadow-sm backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center gap-0 p-0 pb-4">
                <div className="flex items-center gap-2 flex-1">
                    <div className="flex size-5 items-center justify-center rounded bg-emerald-500/10">
                        <TrendingUp className="size-3 text-emerald-500" />
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                        most used resources
                    </span>
                </div>
                {resources.length > 0 && (
                    <span className="font-mono text-[10px] text-muted-foreground/50 tabular-nums">
                        top {resources.length}
                    </span>
                )}
            </CardHeader>

            <CardContent className="flex flex-1 flex-col p-0">
                {resources.length > 0 ? (
                    <ScrollArea className="h-[200px] w-full">
                        <div className="flex flex-col gap-1.5 pr-3">
                            {resources.map((res, idx) => {
                                const rawUrl = res.link || res.url || ""
                                const targetUrl = /^(https?:)?\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`
                                let cleanUrl = ""
                                try {
                                    cleanUrl = new URL(targetUrl).hostname.replace(/^www\./i, "")
                                } catch {
                                    cleanUrl = rawUrl.replace(/^(https?:\/\/)?(www\.)?/i, "").split("/")[0]
                                }

                                return (
                                    <a
                                        key={res.id || res._id?.toString()}
                                        href={targetUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group/item flex items-center justify-between rounded-lg border border-border/40 bg-muted/5 px-3 py-2.5 transition-all hover:border-primary/20 hover:bg-muted/30"
                                    >
                                        <div className="flex min-w-0 items-center gap-3 pr-2">
                                            <span className="shrink-0 font-mono text-[10px] font-bold text-muted-foreground/30 w-4 tabular-nums">
                                                {idx + 1}
                                            </span>
                                            <div className="flex flex-col min-w-0 gap-0.5">
                                                <span className="truncate text-xs font-medium text-foreground transition-colors group-hover/item:text-primary">
                                                    {res.name || res.title}
                                                </span>
                                                <span className="truncate text-[10px] text-muted-foreground/50">
                                                    {cleanUrl}
                                                </span>
                                            </div>
                                        </div>
                                        <Badge variant="secondary" className="shrink-0 font-mono text-[10px] tabular-nums">
                                            {res.useCount || 0}×
                                        </Badge>
                                    </a>
                                )
                            })}
                        </div>
                    </ScrollArea>
                ) : (
                    <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/40 bg-muted/10 py-6">
                        <div className="flex size-8 items-center justify-center rounded-full bg-emerald-500/10">
                            <MousePointerClick className="size-4 text-emerald-500/60" />
                        </div>
                        <div className="flex flex-col items-center gap-0.5">
                            <p className="text-xs font-medium text-foreground">No usage data yet</p>
                            <p className="text-[10px] text-muted-foreground/60 text-center max-w-[160px]">
                                Resources you click will be ranked here by use count.
                            </p>
                        </div>
                        <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2 mt-0.5" asChild>
                            <Link href="/resources">Start exploring →</Link>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}