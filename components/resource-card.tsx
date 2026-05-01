"use client"

import * as React from "react"
import Image from "next/image"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLinkIcon } from "lucide-react"
import { Resource } from "@/lib/data"
import { cn } from "@/lib/utils"

export const ResourceCard = React.memo(function ResourceCard({ resource }: { resource: Resource }) {
  // Use WordPress mshots as primary with unoptimized={true} to avoid Next.js proxy timeouts
  const previewUrl = `https://s0.wp.com/mshots/v1/${encodeURIComponent(resource.link)}?w=600&h=400`
  
  const [imgSrc, setImgSrc] = React.useState(previewUrl)
  const [isLoading, setIsLoading] = React.useState(true)
  const [hasError, setHasError] = React.useState(false)

  return (
    <a
      href={resource.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block group h-full focus-visible:outline-hidden"
    >
      <Card className="relative h-full overflow-hidden p-0 border-border/40 bg-card/60 transition-[border-color,background-color,shadow,transform] duration-300 hover:border-primary/20 hover:bg-card hover:shadow-xl hover:shadow-primary/5 will-change-[transform,shadow]">
        <div className="relative aspect-video w-full overflow-hidden bg-muted/30 will-change-transform">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse">
              <div className="size-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
            </div>
          )}
          <Image
            src={imgSrc}
            alt={resource.name}
            width={600}
            height={400}
            className={cn(
              "h-full w-full object-cover transition-all duration-500 group-hover:scale-105",
              isLoading ? "opacity-0" : "opacity-100"
            )}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              if (!hasError) {
                // If WordPress fails, try Microlink as a secondary fallback
                setHasError(true)
                setImgSrc(`https://api.microlink.io/?url=${encodeURIComponent(resource.link)}&screenshot=true&meta=false&embed=screenshot.url`)
              } else {
                // If both fail, use the branded placeholder
                setImgSrc(`https://avatar.vercel.sh/${resource.name}?size=400&text=${resource.name.substring(0, 2)}`)
                setIsLoading(false)
              }
            }}
            unoptimized={true}
            loading="lazy"
          />
          {/* Hover Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-background/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/95 text-primary-foreground shadow-lg transition-transform duration-300 scale-90 group-hover:scale-100 hover:scale-110 will-change-transform">
              <ExternalLinkIcon className="size-5" />
            </div>
          </div>
        </div>
        <CardHeader className="px-4 py-3 space-y-0.5">
          <CardTitle className="line-clamp-1 text-base font-bold tracking-tight text-foreground/90 transition-colors group-hover:text-primary">
            {resource.name}
          </CardTitle>
          <p className="line-clamp-2 text-[11px] leading-tight text-muted-foreground/70">
            {resource.description}
          </p>
        </CardHeader>
      </Card>
    </a>
  )
})
