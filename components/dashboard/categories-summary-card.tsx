"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Folders, ArrowRight, FolderOpen } from "lucide-react"
import Link from "next/link"
import { ICON_MAP } from "@/lib/icons"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"

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
            <Card className="flex h-full flex-col justify-between border-border/50 bg-card/60 p-5 shadow-sm backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center gap-2 p-0 pb-3">
                    <Folders className="size-4 text-amber-500" />
                    <CardTitle className="text-sm font-semibold italic lowercase text-muted-foreground/90">
                        categories
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-center items-center py-6 p-0">
                    <Link
                        href="/categories"
                        className="group flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2.5 text-xs font-medium text-muted-foreground transition-all hover:border-primary/20 hover:bg-primary/5 hover:text-primary w-full"
                    >
                        <span>Create your first category &rarr;</span>
                    </Link>
                </CardContent>
            </Card>
        )
    }

    const totalCategories = categories.length
    const totalResourceCount = categories.reduce((sum, cat) => sum + (cat.resourceCount || 0), 0)
    const maxResourceCount = Math.max(...categories.map((c) => c.resourceCount || 0), 1)

    const topCategories = [...categories]
        .sort((a, b) => (b.resourceCount || 0) - (a.resourceCount || 0))
        .slice(0, 5)

    return (
        <Card className="flex h-full flex-col justify-between border-border/50 bg-card/60 p-5 shadow-sm backdrop-blur-sm gap-5">
            {/* Header */}
            <CardHeader className="flex flex-row items-center gap-2 p-0">
                <Folders className="size-4 text-amber-500" />
                <CardTitle className="text-sm font-semibold italic lowercase text-muted-foreground/90">
                    categories
                </CardTitle>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col gap-4 p-0">
                {/* Stats Row */}
                <div className="grid grid-cols-2 divide-x divide-border/40">
                    <div className="flex flex-col gap-1 px-3 first:pl-0">
                        <span className="font-mono text-[10px] lowercase tracking-wider text-muted-foreground/70">
                            categories
                        </span>
                        <span className="font-mono text-2xl font-extrabold tracking-tight text-foreground tabular-nums">
                            {totalCategories}
                        </span>
                    </div>
                    <div className="flex flex-col gap-1 px-3 last:pr-0">
                        <span className="font-mono text-[10px] lowercase tracking-wider text-muted-foreground/70">
                            resources
                        </span>
                        <span className="font-mono text-2xl font-extrabold tracking-tight text-foreground tabular-nums">
                            {totalResourceCount}
                        </span>
                    </div>
                </div>

                {/* Top Categories List */}
                <div className="flex flex-col gap-3">
                    <span className="font-mono text-[10px] lowercase tracking-wider text-muted-foreground/60">
                        top categories
                    </span>
                    <ScrollArea className="h-[140px] w-full">
                        <div className="flex flex-col gap-2 pr-3.5">
                            {topCategories.map((cat) => {
                                const title = cat.title || cat.name || "Untitled Category"
                                const count = cat.resourceCount || 0
                                const density = maxResourceCount > 0 ? (count / maxResourceCount) * 100 : 0
                                const Icon = (cat.icon && ICON_MAP[cat.icon as keyof typeof ICON_MAP]) || FolderOpen

                                const catId = cat.id || cat._id?.toString()

                                return (
                                    <div key={catId} className="flex flex-col gap-1.5 group/item">
                                        <div className="flex items-center justify-between text-xs">
                                            <Link
                                                href={`/categories/${catId}`}
                                                className="flex items-center gap-1.5 font-medium hover:text-primary transition-colors truncate"
                                            >
                                                <Icon className="size-3.5 shrink-0 text-amber-500/70 group-hover/item:text-amber-500" />
                                                <span className="truncate lowercase">{title}</span>
                                            </Link>
                                            <span className="font-mono text-[10px] text-muted-foreground/80 tabular-nums">
                                                {count} {count === 1 ? "item" : "items"}
                                            </span>
                                        </div>
                                        {/* Density Bar */}
                                        <Progress 
                                            value={density} 
                                            className="h-1 bg-muted/40 [&>[data-slot=progress-indicator]]:bg-amber-500/60 group-hover/item:[&>[data-slot=progress-indicator]]:bg-amber-500 transition-all duration-500" 
                                        />
                                    </div>
                                )
                            })}
                        </div>
                    </ScrollArea>
                </div>

                {/* Manage Categories CTA */}
                <div className="mt-auto pt-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-full justify-between px-0 text-xs font-semibold text-primary/80 hover:bg-transparent hover:text-primary group"
                        asChild
                    >
                        <Link href="/categories">
                            <span>Manage Categories</span>
                            <ArrowRight data-icon="inline-end" className="transition-transform group-hover:translate-x-1" />
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
