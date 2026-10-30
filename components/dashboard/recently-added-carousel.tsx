"use client"

import { useState, useEffect, useCallback } from "react"
import { Resource } from "@/types"
import { ResourceCard } from "@/components/resources/resource-card"
import { Button } from "@/components/ui/button"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    type CarouselApi,
} from "@/components/ui/carousel"
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, PackagePlus } from "lucide-react"
import Link from "next/link"

interface RecentlyAddedCarouselProps {
    resources: Resource[]
}

export function RecentlyAddedCarousel({ resources }: RecentlyAddedCarouselProps) {
    const [api, setApi] = useState<CarouselApi>()
    const [canScrollPrev, setCanScrollPrev] = useState(false)
    const [canScrollNext, setCanScrollNext] = useState(false)

    useEffect(() => {
        if (!api) return

        const updateScroll = () => {
            setCanScrollPrev(api.canScrollPrev())
            setCanScrollNext(api.canScrollNext())
        }

        // Set initial state
        updateScroll()

        api.on("select", updateScroll)
        api.on("reInit", updateScroll)

        return () => {
            api.off("select", updateScroll)
        }
    }, [api])

    const scrollPrev = useCallback(() => {
        api?.scrollPrev()
    }, [api])

    const scrollNext = useCallback(() => {
        api?.scrollNext()
    }, [api])

    return (
        <div className="flex flex-col gap-3">
            {/* Header with Title and Controls */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-primary" />
                    <span className="font-heading text-sm font-medium text-muted-foreground">
                        Recently Added
                    </span>
                    {resources.length > 0 && (
                        <span className="font-mono text-xs text-muted-foreground/60 tabular-nums">
                            {resources.length}
                        </span>
                    )}
                </div>

                {/* Navigation Buttons + View all link */}
                <div className="flex items-center gap-1.5">
                    {resources.length > 1 && (
                        <>
                            <Button
                                variant="outline"
                                size="icon-xs"
                                onClick={scrollPrev}
                                disabled={!canScrollPrev}
                                aria-label="Previous slide"
                            >
                                <ChevronLeft className="size-3.5" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon-xs"
                                onClick={scrollNext}
                                disabled={!canScrollNext}
                                aria-label="Next slide"
                            >
                                <ChevronRight className="size-3.5" />
                            </Button>
                        </>
                    )}
                    <Button
                        variant="ghost"
                        size="xs"
                        render={<Link href="/resources" />}
                        nativeButton={false}
                    >
                        All
                        <ArrowRight className="size-3" />
                    </Button>
                </div>
            </div>

            {resources.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2.5 rounded-xl border border-dashed border-border/40 bg-muted/10 py-10">
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                        <PackagePlus className="size-5 text-primary/60" />
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <p className="text-xs font-medium text-foreground">No resources yet</p>
                        <p className="text-[11px] text-muted-foreground/60 text-center max-w-[180px]">
                            Save your first resource to see it here.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="mt-0.5"
                        render={<Link href="/resources/new" />}
                        nativeButton={false}
                    >
                        Add resource
                    </Button>
                </div>
            ) : (
                <Carousel
                    setApi={setApi}
                    opts={{ align: "start", loop: false }}
                    className="w-full"
                >
                    <CarouselContent>
                        {resources.map((resource, index) => (
                            <CarouselItem
                                key={resource.id || resource._id?.toString()}
                                className="basis-full sm:basis-1/2"
                            >
                                <div className="p-1">
                                    <ResourceCard
                                        resource={resource}
                                        priority={index < 2}
                                    />
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
            )}
        </div>
    )
}
