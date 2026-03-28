"use client"

import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLinkIcon } from "lucide-react"
import { Resource } from "@/lib/data"

export function ResourceCard({ resource }: { resource: Resource }) {
  const previewUrl = `https://s0.wp.com/mshots/v1/${encodeURIComponent(resource.link)}?w=600&h=400`

  return (
    <a
      href={resource.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block group h-full focus-visible:outline-hidden"
    >
      <Card className="relative h-full overflow-hidden p-0 border-border/40 bg-card/40 backdrop-blur-sm transition-all duration-300 hover:border-primary/20 hover:bg-card hover:shadow-2xl hover:shadow-primary/5">
        <div className="relative aspect-video w-full overflow-hidden bg-muted/30">
          <img
            src={previewUrl}
            alt={resource.name}
            className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:blur-[1px]"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://via.placeholder.com/600x400/09090b/a1a1aa?text=${encodeURIComponent(resource.name)}`
            }}
          />
          {/* Hover Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-background/10 opacity-0 backdrop-blur-[1px] transition-all duration-300 group-hover:opacity-100">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/60 backdrop-blur-sm text-primary-foreground shadow-lg transition-all duration-300 scale-90 group-hover:scale-100 hover:bg-primary/90 hover:scale-110">
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
}
