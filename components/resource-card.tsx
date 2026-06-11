"use client"

import * as React from "react"
import Image from "next/image"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLinkIcon, PencilIcon, Trash2Icon } from "lucide-react"
import { Resource } from "@/lib/data"
import { cn } from "@/lib/utils"
import { trackResourceViewAction, useResourceAction } from "@/lib/actions"

export const ResourceCard = React.memo(function ResourceCard({
  resource,
  priority = false,
  onClick,
  onEdit,
  onDelete,
}: {
  resource: Resource
  priority?: boolean
  onClick?: (e: React.MouseEvent) => void
  onEdit?: (e: React.MouseEvent) => void
  onDelete?: (e: React.MouseEvent) => void
}) {
  const rawUrl = resource.link || ""
  const targetUrl = /^(https?:)?\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`

  // Use Microlink API as primary screenshot provider
  const previewUrl = `https://api.microlink.io/?url=${encodeURIComponent(resource.link)}&screenshot=true&meta=false&embed=screenshot.url`

  const [imgSrc, setImgSrc] = React.useState(previewUrl)
  const [isLoading, setIsLoading] = React.useState(true)
  const [hasError, setHasError] = React.useState(false)

  // Fire-and-forget: never block navigation
  const handleTrack = React.useCallback(() => {
    const id = (resource as any).id || (resource as any)._id?.toString()
    if (!id) return
    trackResourceViewAction(id)
    useResourceAction(id)
  }, [(resource as any).id])

  const content = (
    <Card className="relative h-full overflow-hidden p-0 border-border/40 bg-card/60 transition-[border-color,background-color,shadow,transform] duration-300 hover:border-primary/20 hover:bg-card hover:shadow-xl hover:shadow-primary/5 will-change-[transform,shadow]">
      <div className="relative aspect-video w-full overflow-hidden bg-muted/30 will-change-transform">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse z-40">
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
              // If Microlink fails, try WordPress mshots as a secondary fallback
              setHasError(true)
              setImgSrc(`https://s0.wp.com/mshots/v1/${encodeURIComponent(resource.link)}?w=600&h=400`)
            } else {
              // If both fail, use the branded placeholder
              setImgSrc(`https://avatar.vercel.sh/${resource.name}?size=400&text=${resource.name.substring(0, 2)}`)
              setIsLoading(false)
            }
          }}
          unoptimized={true}
          priority={priority}
          loading={priority ? undefined : "lazy"}
        />
        {/* Hover Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-background/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-30">
          {onClick ? (
            <a
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.stopPropagation()
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/95 text-primary-foreground shadow-lg transition-transform duration-300 scale-90 group-hover:scale-100 hover:scale-110 will-change-transform"
            >
              <ExternalLinkIcon className="size-5" />
            </a>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/95 text-primary-foreground shadow-lg transition-transform duration-300 scale-90 group-hover:scale-100 hover:scale-110 will-change-transform">
              <ExternalLinkIcon className="size-5" />
            </div>
          )}
        </div>

        {/* Edit/Delete Actions */}
        {(onEdit || onDelete) && (
          <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  onEdit(e)
                }}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-background/80 hover:bg-background border border-border/40 backdrop-blur-xs text-muted-foreground hover:text-foreground transition-all shadow-xs cursor-pointer"
                title="Edit Resource"
              >
                <PencilIcon className="size-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  onDelete(e)
                }}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-destructive/80 hover:bg-destructive border border-destructive/20 backdrop-blur-xs text-destructive-foreground transition-all shadow-xs cursor-pointer"
                title="Delete Resource"
              >
                <Trash2Icon className="size-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
      <CardHeader className="flex flex-col gap-0.5 px-4 py-3">
        <CardTitle className="line-clamp-1 text-base font-bold tracking-tight text-foreground/90 transition-colors group-hover:text-primary">
          {resource.name}
        </CardTitle>
        <p className="line-clamp-2 text-[11px] leading-tight text-muted-foreground/70">
          {resource.description}
        </p>
      </CardHeader>
    </Card>
  )

  if (onClick) {
    return (
      <div
        onClick={(e) => { handleTrack(); onClick(e) }}
        className="block group h-full focus-visible:outline-hidden cursor-pointer"
      >
        {content}
      </div>
    )
  }

  return (
    <a
      href={targetUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleTrack}
      className="block group h-full focus-visible:outline-hidden"
    >
      {content}
    </a>
  )
})