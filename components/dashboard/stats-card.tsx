"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { gsap } from "gsap"
import { useGSAP } from "@gsap/react"
import { Layers, Zap, Star, Activity } from "lucide-react"
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

    const items = [
        { label: "resources", value: counts.resources, icon: Layers, colorClass: "text-blue-500", bgClass: "bg-blue-500/10" },
        { label: "categories", value: counts.categories, icon: Zap, colorClass: "text-amber-500", bgClass: "bg-amber-500/10" },
        { label: "favorites", value: counts.favorites, icon: Star, colorClass: "text-purple-500", bgClass: "bg-purple-500/10" },
    ]

    return (
        <Card className="flex h-full flex-col border-border/50 bg-card/60 p-5 shadow-sm backdrop-blur-sm">
            {/* Card heading */}
            <div className="flex items-center gap-2 mb-4">
                <div className="flex size-5 items-center justify-center rounded bg-blue-500/10">
                    <Activity className="size-3 text-blue-500" />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                    workspace stats
                </span>
            </div>

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

            {/* Health & Status — pinned to bottom via mt-auto */}
            <div className="mt-auto flex flex-col gap-2.5 pt-4">
                <Separator className="bg-border/40" />

                {inboxCount > 0 ? (
                    <Link
                        href="/resources?filter=uncategorized"
                        className="group flex items-center justify-between rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 text-xs font-medium text-amber-500/90 transition-all hover:bg-amber-500/10 hover:text-amber-500"
                    >
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm">⚠️</span>
                            <span>{inboxCount} items need organization</span>
                        </div>
                        <span className="text-[10px] opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100">
                            &rarr;
                        </span>
                    </Link>
                ) : (
                    <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5 text-xs font-medium text-emerald-400/90">
                        <span className="text-sm">✓</span>
                        <span>inbox clean · workspace healthy</span>
                    </div>
                )}

                <div className="flex items-center justify-between font-mono text-[10px] lowercase tracking-wider text-muted-foreground/50">
                    <span>volt synced · recently active</span>
                    <span className="relative flex size-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
                    </span>
                </div>
            </div>
        </Card>
    )
}