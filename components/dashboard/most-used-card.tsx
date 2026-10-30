"use client"

import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, MousePointerClick } from "lucide-react"
import { Resource } from "@/types"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface MostUsedCardProps {
    resources: Resource[]
}

export function MostUsedCard({ resources }: MostUsedCardProps) {
    return (
        <Card size="sm" className="flex h-full flex-col">
            <CardHeader>
                <CardTitle>
                    <span className="flex items-center gap-2">
                        <TrendingUp className="size-4 text-emerald-500" />
                        <span className="text-muted-foreground">Most Used Resources</span>
                    </span>
                </CardTitle>
                {resources.length > 0 && (
                    <CardAction>
                        <span className="font-mono text-xs text-muted-foreground/60 tabular-nums">
                            top {resources.length}
                        </span>
                    </CardAction>
                )}
            </CardHeader>

            <CardContent className="flex flex-1 flex-col">
                {resources.length > 0 ? (
                    <ScrollArea className="h-[200px] w-full">
                        <div className="flex flex-col gap-1.5 pr-3">
                            {resources.map((res, idx) => {
                                const rawUrl = res.url || ""
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
                                                    {res.title}
                                                </span>
                                                <span className="truncate text-[10px] text-muted-foreground/50">
                                                    {cleanUrl}
                                                </span>
                                            </div>
                                        </div>
                                        <Badge variant="secondary" className="shrink-0">
                                            <span className="font-mono tabular-nums">{res.useCount || 0}×</span>
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
                        <Button
                            variant="ghost"
                            size="xs"
                            className="mt-0.5"
                            render={<Link href="/resources" />}
                            nativeButton={false}
                        >
                            Start exploring →
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
