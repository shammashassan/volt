"use client"

import * as React from "react"
import { useMemo, useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ExternalLinkIcon, PencilIcon, Trash2Icon, Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import { trackResourceViewAction, useResourceAction } from "@/lib/actions"
import { getResourceTypeInfo } from "./resource-types"

// Minimum data structure a resource must have to be rendered by ResourceCard
export interface ResourceCardData {
  title: string
  url: string
  description: string
  id?: string
  _id?: unknown
  type?: string
}

interface ResourceCardProps<T> {
  resource: T
  priority?: boolean
  onClick?: (e: React.MouseEvent) => void
  onEdit?: (resource: T, e: React.MouseEvent) => void
  onDelete?: (resource: T, e: React.MouseEvent) => void
  disableRedirect?: boolean
}

interface ResourceCardOverlayProps<T> {
  targetUrl: string
  hasClick: boolean
  resource: T
  onEdit?: (resource: T, e: React.MouseEvent) => void
  onDelete?: (resource: T, e: React.MouseEvent) => void
  disableRedirect?: boolean
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

const GRADIENTS = [
  "from-blue-600 to-indigo-700",
  "from-violet-600 to-purple-700",
  "from-pink-600 to-rose-700",
  "from-emerald-600 to-teal-700",
  "from-amber-500 to-orange-700",
]

function getGradient(title: string) {
  let hash = 0
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % GRADIENTS.length
  return GRADIENTS[index]
}

function getInitials(title: string): string {
  const cleanTitle = title.replace(/^(https?:\/\/)?(www\.)?/, "").trim()
  if (!cleanTitle) return "R"
  const parts = cleanTitle.split(/[\s\-_.\/]+/).filter(Boolean)
  if (parts.length === 0) return "R"
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase()
}

function useScreenshot<T extends ResourceCardData>(resource: T, shouldLoad: boolean) {
  const normalizedUrl = useMemo(() => normalizeUrl(resource.url || ""), [resource.url])

  const previewUrl = useMemo(() => {
    return getPreviewUrl(normalizedUrl, resource.title)
  }, [normalizedUrl, resource.title])

  const [imgSrc, setImgSrc] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isRetrying, setIsRetrying] = useState(false)
  // 0 = metadata (fetching), 1 = microlink, 2 = wp.com/mshots, 3 = css fallback
  const [stage, setStage] = useState(0)

  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // React standard pattern to sync state when preview URL changes or shouldLoad becomes true
  useEffect(() => {
    if (!shouldLoad) return

    let active = true
    if (retryTimer.current) clearTimeout(retryTimer.current)

    // Reset everything when the URL changes or shouldLoad becomes true
    setIsLoading(true)
    setIsRetrying(false)
    setStage(0)

    const fetchMetadata = async () => {
      try {
        const res = await fetch(`/api/resources/metadata?url=${encodeURIComponent(normalizedUrl)}`)
        if (!active) return

        if (res.ok) {
          const data = await res.json()
          if (data.imageUrl) {
            setImgSrc(data.imageUrl)
            return
          }
        }
      } catch (err) {
        console.error("Metadata fetch failed", err)
      }

      // No imageUrl found or fetch failed -> go to Stage 1 (Microlink)
      if (active) {
        setStage(1)
        setImgSrc(previewUrl)
      }
    }

    void fetchMetadata()

    return () => {
      active = false
      if (retryTimer.current) clearTimeout(retryTimer.current)
    }
  }, [previewUrl, normalizedUrl, shouldLoad])

  const handleLoad = useCallback(() => {
    setIsLoading(false)
    setIsRetrying(false)
  }, [])

  const handleError = useCallback(() => {
    if (!shouldLoad) return
    if (retryTimer.current) clearTimeout(retryTimer.current)

    // Set retrying state to true immediately to hide the broken image icon
    setIsRetrying(true)

    retryTimer.current = setTimeout(() => {
      setIsRetrying(false)

      setStage((prevStage) => {
        const nextStage = prevStage + 1
        if (nextStage === 1) {
          // Move from OG Image -> Microlink
          setImgSrc(previewUrl)
        } else if (nextStage === 2) {
          // Move from Microlink -> WordPress Mshots
          if (normalizedUrl) {
            setImgSrc(
              `https://s0.wp.com/mshots/v1/${encodeURIComponent(normalizedUrl)}?w=600&h=400`
            )
          } else {
            setIsLoading(false)
            return 3
          }
        } else {
          // Move to CSS fallback
          setIsLoading(false)
          return 3
        }
        return nextStage
      })
    }, 150)
  }, [previewUrl, normalizedUrl, shouldLoad])

  // Check if image is already completed (cached) when source or ref changes
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null)

  useEffect(() => {
    if (!shouldLoad) return
    if (imgElement && imgElement.complete) {
      setIsLoading(false)
      setIsRetrying(false)
    }
  }, [imgElement, imgSrc, shouldLoad])

  return {
    imgSrc: isRetrying ? "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" : imgSrc,
    isLoading: (isLoading || isRetrying) && stage < 3,
    hasError: stage === 3,
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
  disableRedirect = false,
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
      {!disableRedirect && (
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
      )}

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
  disableRedirect = false,
}: ResourceCardProps<T>) {
  const targetUrl = useMemo(() => normalizeUrl(resource.url), [resource.url])

  const externalProps = useMemo(
    () => ({
      href: targetUrl,
      target: "_blank",
      rel: "noopener noreferrer",
    }),
    [targetUrl]
  )

  const [hasBeenVisible, setHasBeenVisible] = useState(priority)
  const containerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (priority) return

    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setHasBeenVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: "200px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [priority])

  const { imgSrc, isLoading, hasError, handleLoad, handleError, setImgElement } = useScreenshot(resource, hasBeenVisible)

  const typeInfo = getResourceTypeInfo(resource.type || "website")
  const TypeIcon = typeInfo?.icon || Globe

  const fallbackCard = (
    <div className={cn(
      "absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br text-white font-bold p-4 select-none",
      getGradient(resource.title)
    )}>
      {/* Icon in top-left */}
      <div className="absolute top-3 left-3 flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 backdrop-blur-xs text-white/90">
        <TypeIcon className="size-4" />
      </div>
      {/* Initials */}
      <div className="text-3xl tracking-wide font-black drop-shadow-xs opacity-90">
        {getInitials(resource.title)}
      </div>
      {/* Domain text */}
      <div className="absolute bottom-3 left-3 text-[10px] uppercase tracking-wider font-semibold opacity-60">
        {(() => {
          try {
            return new URL(normalizeUrl(resource.url || "")).hostname.replace("www.", "")
          } catch {
            return ""
          }
        })()}
      </div>
    </div>
  )

  const resourceId = resource.id || (resource._id as string | undefined)?.toString()
  const handleTrack = useCallback(() => {
    if (!resourceId) return
    void trackResourceViewAction(resourceId)
    // eslint-disable-next-line react-hooks/rules-of-hooks
    void useResourceAction(resourceId)
  }, [resourceId])

  const content = (
    <Card className="relative h-full overflow-hidden p-0 border-border/40 bg-card/60 transition-[border-color,background-color,shadow,transform] duration-300 hover:border-primary/20 hover:bg-card hover:shadow-lg hover:shadow-primary/5 will-change-[transform,shadow]">
      <div className="relative aspect-video w-full overflow-hidden bg-muted/30 will-change-transform">
        {(isLoading || !hasBeenVisible) && (
          <Skeleton className="absolute inset-0 rounded-none z-40" />
        )}
        {hasBeenVisible && !hasError && (
          <Image
            ref={setImgElement}
            src={imgSrc || "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"}
            alt={resource.title}
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
        )}
        {hasError && fallbackCard}

        <ResourceCardOverlay
          targetUrl={targetUrl}
          hasClick={!!onClick}
          resource={resource}
          onEdit={onEdit}
          onDelete={onDelete}
          disableRedirect={disableRedirect}
        />
      </div>
      <CardHeader className="flex flex-col gap-0.5 px-4 py-3">
        <CardTitle className="line-clamp-1 text-base font-semibold tracking-tight text-foreground/90 transition-colors group-hover:text-primary">
          {resource.title}
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
        ref={containerRef as any}
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

  if (disableRedirect) {
    return (
      <div ref={containerRef as any} className="block group h-full focus-visible:outline-hidden">
        {content}
      </div>
    )
  }

  return (
    <a
      ref={containerRef as any}
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