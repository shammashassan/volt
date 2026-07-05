"use client"

import { useState, useEffect, useCallback } from "react"
import { type CarouselApi, Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"
import { Clock, ArrowRight, PackagePlus, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { ResourceCard } from "@/components/resources/resource-card"
import { Resource } from "@/types"
import { Resource as DataResource } from "@/lib/data"

interface RecentlyAddedCarouselProps {
    resources: Resource[]
}

export function RecentlyAddedCarousel({ resources }: RecentlyAddedCarouselProps) {
    const [api, setApi] = useState<CarouselApi>()
    const [canPrev, setCanPrev] = useState(false)
    const [canNext, setCanNext] = useState(false)

    const updateButtons = useCallback(() => {
        if (!api) return
        setCanPrev(api.canScrollPrev())
        setCanNext(api.canScrollNext())
    }, [api])

    useEffect(() => {
        if (!api) return
        updateButtons()
        api.on("select", updateButtons)
        api.on("reInit", updateButtons)
        return () => { api.off("select", updateButtons) }
    }, [api, updateButtons])

    return (
        <div className="flex flex-col gap-3">
            {/* Section header */}
            <div className="flex items-center justify-between px-0.5">
                <div className="flex items-center gap-2">
                    <div className="flex size-5 items-center justify-center rounded bg-primary/10">
                        <Clock className="size-3 text-primary" />
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                        recently added
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    {resources.length > 0 && (
                        <>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-6"
                                onClick={() => api?.scrollPrev()}
                                disabled={!canPrev}
                            >
                                <ChevronLeft className="size-3.5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-6"
                                onClick={() => api?.scrollNext()}
                                disabled={!canNext}
                            >
                                <ChevronRight className="size-3.5" />
                            </Button>
                        </>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 gap-1 px-2 text-[10px] font-medium text-muted-foreground/60 hover:text-foreground"
                        asChild
                    >
                        <Link href="/resources">
                            All
                            <ArrowRight className="size-3" />
                        </Link>
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
                    <Button variant="outline" size="sm" className="h-7 text-xs mt-0.5" asChild>
                        <Link href="/resources/new">Add resource</Link>
                    </Button>
                </div>
            ) : (
                <Carousel
                    setApi={setApi}
                    opts={{ align: "start", loop: false }}
                    className="w-full [&_[data-slot=carousel-content]]:py-3 [&_[data-slot=carousel-content]]:-my-3 [&_[data-slot=carousel-content]]:px-2 [&_[data-slot=carousel-content]]:-mx-2"
                >
                    <CarouselContent className="-ml-3">
                        {resources.map((resource, index) => (
                            <CarouselItem
                                key={resource.id || resource._id?.toString()}
                                className="pl-3 basis-full sm:basis-1/2"
                            >
                                <ResourceCard
                                    resource={resource as unknown as DataResource}
                                    priority={index < 2}
                                />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
            )}
        </div>
    )
}