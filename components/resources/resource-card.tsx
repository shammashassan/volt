"use client"

import * as React from "react"
import { useMemo, useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ExternalLinkIcon, PencilIcon, Trash2Icon } from "lucide-react"
import { cn } from "@/lib/utils"
import { trackResourceViewAction, useResourceAction } from "@/lib/actions"

// Minimum data structure a resource must have to be rendered by ResourceCard
export interface ResourceCardData {
  name: string
  link: string
  description: string
  id?: string
  _id?: unknown
}

interface ResourceCardProps<T> {
  resource: T
  priority?: boolean
  onClick?: (e: React.MouseEvent) => void
  onEdit?: (resource: T, e: React.MouseEvent) => void
  onDelete?: (resource: T, e: React.MouseEvent) => void
}

interface ResourceCardOverlayProps<T> {
  targetUrl: string
  hasClick: boolean
  resource: T
  onEdit?: (resource: T, e: React.MouseEvent) => void
  onDelete?: (resource: T, e: React.MouseEvent) => void
}

// Pure helper to normalize URLs defensively
function normalizeUrl(url: string): string {
  const rawUrl = url || ""
  if (!rawUrl) return ""
  return /^(https?:)?\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`
}

// Pure helper to resolve the preview URL
function getPreviewUrl(link: string, fallbackName: string): string {
  if (!link) {
    return getFallbackImage(fallbackName)
  }
  return `https://api.microlink.io/?url=${encodeURIComponent(link)}&screenshot=true&meta=false&embed=screenshot.url`
}

// Pure helper to generate fallback initials images
function getFallbackImage(name: string): string {
  const safeName = name || "Resource"
  return `https://avatar.vercel.sh/${safeName}?size=400&text=${safeName.slice(0, 2)}`
}

// Custom hook to handle screenshot loading, state synchronization, and fallbacks.
// Microlink & wp.com/mshots are on-demand screenshot services: the first request
// triggers generation and may return an error/blank while still processing.
// We auto-retry with exponential backoff so the user never has to reload manually.
const MAX_MICROLINK_RETRIES = 4
const RETRY_BASE_DELAY_MS = 3000

function useScreenshot<T extends ResourceCardData>(resource: T) {
  const normalizedUrl = useMemo(() => normalizeUrl(resource.link || ""), [resource.link])

  const previewUrl = useMemo(() => {
    return getPreviewUrl(normalizedUrl, resource.name)
  }, [normalizedUrl, resource.name])

  const [imgSrc, setImgSrc] = useState(previewUrl)
  const [isLoading, setIsLoading] = useState(true)

  // Tracks which fallback stage we are on:
  //   0 = microlink (retrying), 1 = wp.com/mshots, 2 = avatar (final)
  const fallbackStage = React.useRef(0)
  // How many times we've retried the current Microlink URL
  const retryCount = React.useRef(0)
  const retryTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  // React standard pattern to sync state when preview URL changes
  useEffect(() => {
    // Reset everything when the URL changes
    if (retryTimer.current) clearTimeout(retryTimer.current)
    fallbackStage.current = 0
    retryCount.current = 0
    setImgSrc(previewUrl)
    setIsLoading(true)
  }, [previewUrl])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (retryTimer.current) clearTimeout(retryTimer.current)
    }
  }, [])

  const handleLoad = useCallback(() => {
    setIsLoading(false)
  }, [])

  const handleError = useCallback(() => {
    if (retryTimer.current) clearTimeout(retryTimer.current)

    if (fallbackStage.current === 0) {
      // Stage 0: Microlink — retry with exponential backoff before giving up
      if (retryCount.current < MAX_MICROLINK_RETRIES) {
        const delay = RETRY_BASE_DELAY_MS * Math.pow(2, retryCount.current)
        retryCount.current += 1
        retryTimer.current = setTimeout(() => {
          // Bust the cache by appending a timestamp so the browser re-fetches
          setImgSrc(
            `${previewUrl}&_retry=${retryCount.current}`
          )
        }, delay)
      } else {
        // Microlink exhausted → try wp.com/mshots
        fallbackStage.current = 1
        retryCount.current = 0
        if (normalizedUrl) {
          setImgSrc(
            `https://s0.wp.com/mshots/v1/${encodeURIComponent(normalizedUrl)}?w=600&h=400`
          )
        } else {
          fallbackStage.current = 2
          setImgSrc(getFallbackImage(resource.name))
          setIsLoading(false)
        }
      }
    } else if (fallbackStage.current === 1) {
      // Stage 1: wp.com/mshots failed — retry once after a delay, then avatar
      if (retryCount.current === 0 && normalizedUrl) {
        retryCount.current = 1
        retryTimer.current = setTimeout(() => {
          setImgSrc(
            `https://s0.wp.com/mshots/v1/${encodeURIComponent(normalizedUrl)}?w=600&h=400&_retry=1`
          )
        }, RETRY_BASE_DELAY_MS)
      } else {
        fallbackStage.current = 2
        setImgSrc(getFallbackImage(resource.name))
        setIsLoading(false)
      }
    } else {
      // Stage 2: Final avatar fallback — nothing more to try
      setImgSrc(getFallbackImage(resource.name))
      setIsLoading(false)
    }
  }, [previewUrl, normalizedUrl, resource.name])

  // Check if image is already completed (cached) when source or ref changes
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null)

  useEffect(() => {
    if (imgElement && imgElement.complete) {
      setIsLoading(false)
    }
  }, [imgElement, imgSrc])

  return {
    imgSrc,
    isLoading,
    handleLoad,
    handleError,
    setImgElement,
  }
}

// Subcomponent: Hover and Actions overlay
const ResourceCardOverlay = React.memo(function ResourceCardOverlay<
  T extends ResourceCardData
>({
  targetUrl,
  hasClick,
  resource,
  onEdit,
  onDelete,
}: ResourceCardOverlayProps<T>) {
  const handleEditClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      onEdit?.(resource, e)
    },
    [resource, onEdit]
  )

  const handleDeleteClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      onDelete?.(resource, e)
    },
    [resource, onDelete]
  )

  return (
    <>
      {/* Hover Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-background/30 backdrop-blur-[1px] opacity-0 has-hover:group-hover:opacity-100 transition-opacity duration-300 z-30 pointer-events-none has-hover:pointer-events-auto">
        {hasClick ? (
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.stopPropagation()
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/95 text-primary-foreground shadow-lg transition-transform duration-300 scale-90 has-hover:group-hover:scale-100 hover:scale-110 will-change-transform"
          >
            <ExternalLinkIcon className="size-5" />
          </a>
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/95 text-primary-foreground shadow-lg transition-transform duration-300 scale-90 has-hover:group-hover:scale-100 hover:scale-110 will-change-transform">
            <ExternalLinkIcon className="size-5" />
          </div>
        )}
      </div>

      {/* Edit/Delete Actions */}
      {(onEdit || onDelete) && (
        <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-100 has-hover:opacity-0 has-hover:group-hover:opacity-100 transition-opacity duration-300 z-50">
          {onEdit && (
            <button
              onClick={handleEditClick}
              className="flex h-8 w-8 has-hover:h-7 has-hover:w-7 items-center justify-center rounded-lg bg-background/80 hover:bg-background border border-border/40 backdrop-blur-xs text-muted-foreground hover:text-foreground transition-all shadow-xs cursor-pointer"
              title="Edit Resource"
              aria-label="Edit Resource"
            >
              <PencilIcon className="size-4 has-hover:size-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={handleDeleteClick}
              className="flex h-8 w-8 has-hover:h-7 has-hover:w-7 items-center justify-center rounded-lg bg-destructive/80 hover:bg-destructive border border-destructive/20 backdrop-blur-xs text-destructive-foreground transition-all shadow-xs cursor-pointer"
              title="Delete Resource"
              aria-label="Delete Resource"
            >
              <Trash2Icon className="size-4 has-hover:size-3.5" />
            </button>
          )}
        </div>
      )}
    </>
  )
}) as <T extends ResourceCardData>(props: ResourceCardOverlayProps<T>) => React.ReactNode

// Main Component
const ResourceCardComponent = function ResourceCardComponent<
  T extends ResourceCardData
>({
  resource,
  priority = false,
  onClick,
  onEdit,
  onDelete,
}: ResourceCardProps<T>) {
  const targetUrl = useMemo(() => normalizeUrl(resource.link), [resource.link])

  const externalProps = useMemo(
    () => ({
      href: targetUrl,
      target: "_blank",
      rel: "noopener noreferrer",
    }),
    [targetUrl]
  )

  const { imgSrc, isLoading, handleLoad, handleError, setImgElement } = useScreenshot(resource)

  const resourceId = resource.id || (resource._id as string | undefined)?.toString()
  const handleTrack = useCallback(() => {
    if (!resourceId) return
    void trackResourceViewAction(resourceId)
    void useResourceAction(resourceId)
  }, [resourceId])

  const content = (
    <Card className="relative h-full overflow-hidden p-0 border-border/40 bg-card/60 transition-[border-color,background-color,shadow,transform] duration-300 hover:border-primary/20 hover:bg-card hover:shadow-lg hover:shadow-primary/5 will-change-[transform,shadow]">
      <div className="relative aspect-video w-full overflow-hidden bg-muted/30 will-change-transform">
        {isLoading && (
          <Skeleton className="absolute inset-0 rounded-none z-40" />
        )}
        <Image
          ref={setImgElement}
          src={imgSrc}
          alt={resource.name}
          width={600}
          height={400}
          className={cn(
            "h-full w-full object-cover transition-all duration-500 group-hover:scale-105",
            isLoading ? "opacity-0" : "opacity-100"
          )}
          onLoad={handleLoad}
          onError={handleError}
          unoptimized={true}
          priority={priority}
          loading={priority ? undefined : "lazy"}
        />

        <ResourceCardOverlay
          targetUrl={targetUrl}
          hasClick={!!onClick}
          resource={resource}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
      <CardHeader className="flex flex-col gap-0.5 px-4 py-3">
        <CardTitle className="line-clamp-1 text-base font-semibold tracking-tight text-foreground/90 transition-colors group-hover:text-primary">
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
        onClick={(e) => {
          handleTrack()
          onClick(e)
        }}
        className="block group h-full focus-visible:outline-hidden cursor-pointer"
      >
        {content}
      </div>
    )
  }

  return (
    <a
      {...externalProps}
      onClick={handleTrack}
      className="block group h-full focus-visible:outline-hidden"
    >
      {content}
    </a>
  )
}

export const ResourceCard = React.memo(ResourceCardComponent) as <
  T extends ResourceCardData
>(
  props: ResourceCardProps<T>
) => React.ReactNode