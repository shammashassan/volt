"use client"

import React, { useRef } from "react"
import { useGSAP } from "@gsap/react"
import { gsap } from "gsap"

import { CommandCenterCard } from "./command-center-card"
import { StatsCard } from "./stats-card"
import { ActivityCard } from "./activity-card"
import { FavoritesListCard } from "./favorites-list-card"
import { CategoriesSummaryCard } from "./categories-summary-card"
import { MostUsedCard } from "./most-used-card"
import { QuickSaveCard } from "./quick-save-card"
import { RecentlyAddedCarousel } from "./recently-added-carousel"
import { InboxFocusCard } from "./inbox-focus-card"
import { MyDayCard } from "./my-day-card"
import { WatchlistUpcomingCard } from "./watchlist-upcoming-card"

import { Resource, Category } from "@/types"

interface CategoryWithCount extends Category {
    resourceCount?: number
}

interface WorkspaceBentoProps {
    userName: string
    resourcesCount: number
    categoriesCount: number
    favoritesCount: number
    recentlyViewed: Resource[]
    recommended: Resource[]
    recentlyValuable: Resource[]
    inboxCount: number
    favorites: Resource[]
    spotlight: Resource | null
    recentlyAdded: Resource[]
    categories: CategoryWithCount[]
    unreadNotifications: number
    remindersCount: number
    releasesCount: number
}

export function WorkspaceBento({
    userName,
    resourcesCount,
    categoriesCount,
    favoritesCount,
    recentlyViewed,
    recommended,
    recentlyValuable,
    inboxCount,
    favorites,
    spotlight,
    recentlyAdded,
    categories,
    unreadNotifications,
    remindersCount,
    releasesCount,
}: WorkspaceBentoProps) {
    const containerRef = useRef<HTMLDivElement>(null)

    useGSAP(
        () => {
            const tiles = gsap.utils.toArray<HTMLElement>(".workspace-card")
            const mm = gsap.matchMedia()

            // Set initial state via GSAP — never via CSS class — so non-JS users see content
            gsap.set(tiles, { opacity: 0, y: 16 })

            mm.add("(prefers-reduced-motion: reduce)", () => {
                gsap.set(tiles, { opacity: 1, y: 0 })
            })

            mm.add("(prefers-reduced-motion: no-preference)", () => {
                gsap.to(tiles, {
                    opacity: 1,
                    y: 0,
                    duration: 0.55,
                    stagger: 0.07,
                    ease: "power2.out",
                    clearProps: "transform",
                })
            })

            return () => mm.revert()
        },
        { scope: containerRef }
    )

    return (
        <div
            ref={containerRef}
            className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 select-none lg:px-6"
        >
            {/* ── Page Header ─────────────────────────────────────── */}
            <header className="flex flex-col gap-2 border-b border-border pb-5 md:flex-row md:items-end md:justify-between">
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                        <p className="font-mono text-[10px] lowercase tracking-widest text-muted-foreground/50">
                            volt workspace
                        </p>
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-mono font-medium text-primary border border-primary/20">
                            v2.0
                        </span>
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                        Welcome back,{" "}
                        <span className="bg-linear-to-r from-primary via-amber-500 to-primary bg-clip-text text-transparent font-bold">
                            {userName || "Developer"}
                        </span>
                    </h1>
                </div>
                <p className="text-sm italic lowercase text-muted-foreground/60">
                    your developer second brain &amp; resource os.
                </p>
            </header>

            {/* ── Grid Container ───────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Row 0: Focus, My Day, Watchlist Upcoming */}
                <div className="workspace-card lg:col-span-1 order-1 lg:order-0 h-[196px]">
                    <InboxFocusCard
                        remindersCount={remindersCount}
                        releasesCount={releasesCount}
                        unreadNotifications={unreadNotifications}
                        inboxCount={inboxCount}
                    />
                </div>
                <div className="workspace-card lg:col-span-1 order-2 lg:order-0 h-[196px]">
                    <MyDayCard />
                </div>
                <div className="workspace-card lg:col-span-1 order-3 lg:order-0 h-[196px]">
                    <WatchlistUpcomingCard />
                </div>

                {/* Row 1: Command Center & Quick Save */}
                <div className="workspace-card lg:col-span-2 order-4 lg:order-0">
                    <CommandCenterCard />
                </div>
                <div className="workspace-card lg:col-span-1 order-5 lg:order-0">
                    <QuickSaveCard />
                </div>

                {/* Row 2: Workspace Activity & Workspace Health */}
                <div className="workspace-card lg:col-span-2 order-6 lg:order-0">
                    <ActivityCard
                        recentlyViewed={recentlyViewed}
                        recommended={recommended}
                        spotlight={spotlight}
                    />
                </div>
                <div className="workspace-card lg:col-span-1 order-8 lg:order-0">
                    <StatsCard
                        resourcesCount={resourcesCount}
                        categoriesCount={categoriesCount}
                        favoritesCount={favoritesCount}
                        inboxCount={inboxCount}
                    />
                </div>

                {/* Row 3: Recently Added carousel & Categories Summary */}
                <div className="workspace-card lg:col-span-2 order-7 lg:order-0">
                    <RecentlyAddedCarousel resources={recentlyAdded} />
                </div>
                <div className="workspace-card lg:col-span-1 order-9 lg:order-0">
                    <CategoriesSummaryCard categories={categories} />
                </div>

                {/* Row 4: Most Used Resources & Favorites */}
                <div className="workspace-card lg:col-span-2 order-10 lg:order-0">
                    <MostUsedCard resources={recentlyValuable} />
                </div>
                <div className="workspace-card lg:col-span-1 order-11 lg:order-0">
                    <FavoritesListCard resources={favorites} />
                </div>
            </div>
        </div>
    )
}