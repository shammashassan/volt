"use client"

import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Folders, ArrowRight, FolderOpen } from "lucide-react"
import Link from "next/link"
import { ICON_MAP } from "@/lib/icons"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Category } from "@/lib/types"

interface CategoryWithCount extends Category {
    resourceCount?: number
}

interface CategoriesSummaryCardProps {
    categories: CategoryWithCount[]
}

export function CategoriesSummaryCard({ categories = [] }: CategoriesSummaryCardProps) {
    if (categories.length === 0) {
        return (
            <Card size="sm" className="h-full flex flex-col border-border/50 bg-card/60 shadow-sm backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex size-5 items-center justify-center rounded bg-amber-500/10">
                            <Folders className="size-3 text-amber-500" />
                        </div>
                        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                            categories
                        </span>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-1 items-center justify-center">
                    <div className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/40 bg-muted/10 py-6">
                        <div className="flex size-8 items-center justify-center rounded-full bg-amber-500/10">
                            <Folders className="size-4 text-amber-500/60" />
                        </div>
                        <div className="flex flex-col items-center gap-0.5">
                            <p className="text-xs font-medium text-foreground">No categories yet</p>
                            <p className="text-[10px] text-muted-foreground/60 text-center">
                                Organise your resources into categories.
                            </p>
                        </div>
                        <Link href="/categories" className="text-[10px] text-primary hover:underline">
                            Create your first category →
                        </Link>
                    </div>
                </CardContent>
            </Card>
        )
    }

    const maxResourceCount = Math.max(...categories.map(c => c.resourceCount || 0), 1)

    const topCategories = [...categories]
        .sort((a, b) => (b.resourceCount || 0) - (a.resourceCount || 0))
        .slice(0, 10)

    return (
        <Card size="sm" className="h-full flex flex-col gap-0 border-border/50 bg-card/60 shadow-sm backdrop-blur-sm">
            {/* Header */}
            <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                    <div className="flex size-5 items-center justify-center rounded bg-amber-500/10">
                        <Folders className="size-3 text-amber-500" />
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                        categories
                    </span>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground/50 tabular-nums">
                    {categories.length} total
                </span>
            </CardHeader>

            <CardContent className="flex-1">
                {/* Compact category rows — with ScrollArea, max 10 items */}
                <ScrollArea className="h-[160px] w-full">
                    <div className="flex flex-col gap-3 pr-3.5">
                        {topCategories.map(cat => {
                            const title = cat.title || cat.name || "Untitled"
                            const count = cat.resourceCount || 0
                            const density = maxResourceCount > 0 ? (count / maxResourceCount) * 100 : 0
                            const Icon = (cat.icon && ICON_MAP[cat.icon as keyof typeof ICON_MAP]) || FolderOpen
                            const catId = cat.id || cat._id?.toString()

                            return (
                                <div key={catId} className="flex flex-col gap-1 group/item">
                                    <div className="flex items-center justify-between gap-2">
                                        <Link
                                            href={`/categories/${catId}`}
                                            className="flex items-center gap-1.5 min-w-0 hover:text-primary transition-colors"
                                        >
                                            <Icon className="size-3 shrink-0 text-amber-500/60 group-hover/item:text-amber-500 transition-colors" />
                                            <span className="text-xs font-medium truncate lowercase">{title}</span>
                                        </Link>
                                        <span className="font-mono text-[10px] text-muted-foreground/60 tabular-nums shrink-0">
                                            {count}
                                        </span>
                                    </div>
                                    <Progress
                                        value={density}
                                        className="h-0.5 bg-muted/30 *:data-[slot=progress-indicator]:bg-amber-500/50 group-hover/item:*:data-[slot=progress-indicator]:bg-amber-500 transition-all duration-500"
                                    />
                                </div>
                            )
                        })}
                    </div>
                </ScrollArea>
            </CardContent>

            {/* Card Footer containing CTA */}
            <CardFooter>
                <Button variant="outline" size="sm" asChild className="w-full">
                    <Link href="/categories">
                        Manage categories
                        <ArrowRight />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    )
}