import * as React from "react"
import Image from "next/image"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLinkIcon } from "lucide-react"
import { Resource } from "@/lib/data"

export const ResourceCard = React.memo(function ResourceCard({ resource }: { resource: Resource }) {
  const previewUrl = `https://s0.wp.com/mshots/v1/${encodeURIComponent(resource.link)}?w=600&h=400`

  return (
    <a
      href={resource.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block group h-full focus-visible:outline-hidden"
    >
      <Card className="relative h-full overflow-hidden p-0 border-border/40 bg-card/60 transition-[border-color,background-color,shadow,transform] duration-300 hover:border-primary/20 hover:bg-card hover:shadow-xl hover:shadow-primary/5 will-change-[transform,shadow]">
        <div className="relative aspect-video w-full overflow-hidden bg-muted/30 will-change-transform">
          <Image
            src={previewUrl}
            alt={resource.name}
            width={600}
            height={400}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized={resource.link.includes('github.com')} 
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
