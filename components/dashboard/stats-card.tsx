"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { gsap } from "gsap"
import { useGSAP } from "@gsap/react"
import { Layers, Zap, Star, Activity, Sparkles, AlertTriangle, CheckCircle2 } from "lucide-react"
import Link from "next/link"

gsap.registerPlugin(useGSAP)

interface StatsCardProps {
    resourcesCount: number
    categoriesCount: number
    favoritesCount: number
    inboxCount: number
}

export function StatsCard({ resourcesCount, categoriesCount, favoritesCount, inboxCount }: StatsCardProps) {
    const [counts, setCounts] = useState({ resources: 0, categories: 0, favorites: 0 })

    useGSAP(() => {
        const obj = { r: 0, c: 0, f: 0 }
        gsap.to(obj, {
            r: resourcesCount,
            c: categoriesCount,
            f: favoritesCount,
            duration: 1,
            ease: "power2.out",
            onUpdate: () => {
                setCounts({
                    resources: Math.floor(obj.r),
                    categories: Math.floor(obj.c),
                    favorites: Math.floor(obj.f),
                })
            },
        })
    }, [resourcesCount, categoriesCount, favoritesCount])

    const organizedCount = Math.max(0, resourcesCount - inboxCount)
    const curationScore = resourcesCount > 0 ? Math.round((organizedCount / resourcesCount) * 100) : 100

    const items = [
        { label: "resources", value: counts.resources, icon: Layers, colorClass: "text-blue-500", bgClass: "bg-blue-500/10" },
        { label: "categories", value: counts.categories, icon: Zap, colorClass: "text-amber-500", bgClass: "bg-amber-500/10" },
        { label: "favorites", value: counts.favorites, icon: Star, colorClass: "text-purple-500", bgClass: "bg-purple-500/10" },
    ]

    return (
        <Card size="sm" className="flex h-full flex-col">
            <CardHeader>
                <CardTitle>
                    <span className="flex items-center gap-2">
                        <Activity className="size-4 text-blue-500" />
                        <span className="text-muted-foreground">Workspace Stats</span>
                    </span>
                </CardTitle>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col justify-between">
                {/* Stats Grid */}
                <div className="grid grid-cols-3 divide-x divide-border/40">
                    {items.map((item, idx) => (
                        <div key={idx} className="flex flex-col gap-2 px-3 first:pl-0 last:pr-0">
                            <div className={`rounded-md p-1 w-fit ${item.bgClass}`}>
                                <item.icon className={`size-3 ${item.colorClass}`} />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-mono text-2xl font-bold tracking-tight text-foreground tabular-nums">
                                    {item.value}
                                </span>
                                <span className="font-mono text-[10px] lowercase tracking-wider text-muted-foreground/60 animate-[pulse_4s_ease-in-out_infinite]">
                                    {item.label}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Stack Curation Progress - Fills empty space with packed useful insight */}
                <div className="my-2 flex flex-col gap-1.5 rounded-lg border border-border/40 bg-muted/20 p-2.5">
                    <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                            <Sparkles className="size-3 text-primary" strokeWidth={1.5} />
                            <span className="font-medium text-foreground">Stack Curation</span>
                        </div>
                        <span className="font-mono text-[11px] font-semibold text-foreground tabular-nums">
                            {curationScore}%
                        </span>
                    </div>
                    <Progress value={curationScore} />
                    <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground/70">
                        <span>{organizedCount} sorted</span>
                        <span>{inboxCount} unsorted</span>
                    </div>
                </div>
            </CardContent>

            {/* Health & Status pinned in CardFooter */}
            <CardFooter>
                {inboxCount > 0 ? (
                    <Link
                        href="/resources?category=none"
                        className="group flex w-full items-center justify-between rounded-lg border border-amber-500/20 bg-amber-500/5 px-2.5 py-1.5 text-xs font-medium text-amber-500/90 transition-all hover:bg-amber-500/10 hover:text-amber-500"
                    >
                        <div className="flex items-center gap-1.5">
                            <AlertTriangle className="size-3.5 shrink-0 text-amber-500" strokeWidth={1.5} />
                            <span>{inboxCount} items need organization</span>
                        </div>
                        <span className="text-[10px] opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100">
                            &rarr;
                        </span>
                    </Link>
                ) : (
                    <div className="flex w-full items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1.5 text-xs font-medium text-emerald-400/90">
                        <CheckCircle2 className="size-3.5 shrink-0 text-emerald-400" strokeWidth={1.5} />
                        <span>inbox clean · workspace healthy</span>
                    </div>
                )}
            </CardFooter>
        </Card>
    )
}
