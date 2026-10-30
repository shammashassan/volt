"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, Plus, FolderPlus, Star, LayoutGrid } from "lucide-react"
import Link from "next/link"

export function CommandCenterCard() {
  const handleOpenSearch = () => {
    window.dispatchEvent(new CustomEvent("open-global-search"))
  }

  return (
    <Card size="sm" className="h-full">
      <CardContent className="h-full">
        <div className="flex h-full flex-col justify-between gap-3 min-w-0">
          {/* Search trigger */}
          <button
            type="button"
            onClick={handleOpenSearch}
            className="group/search flex w-full cursor-pointer select-none items-center gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3 transition-colors hover:border-border hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Search className="size-4 shrink-0 text-muted-foreground transition-colors group-hover/search:text-foreground" />
            <span className="flex-1 text-left text-sm text-muted-foreground">
              Search your stack…
            </span>
            <div className="flex shrink-0 items-center gap-1">
              <kbd className="hidden rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline">
                ⌘K
              </kbd>
              <kbd className="hidden rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground md:inline">
                Ctrl K
              </kbd>
            </div>
          </button>

          {/* Quick actions */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 min-w-0">
            <span className="sticky left-0 z-10 mr-1 shrink-0 bg-card pr-2 font-mono text-[10px] lowercase tracking-wider text-muted-foreground/60">
              quick actions
            </span>
            <Button
              variant="outline"
              size="sm"
              render={<Link href="/resources?new=true" />}
              nativeButton={false}
            >
              <Plus data-icon="inline-start" />
              Add resource
            </Button>
            <Button
              variant="outline"
              size="sm"
              render={<Link href="/categories?new=category" />}
              nativeButton={false}
            >
              <FolderPlus data-icon="inline-start" />
              New category
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { window.location.hash = "#favorites" }}
            >
              <Star data-icon="inline-start" />
              Favorites
            </Button>
            <Button
              variant="outline"
              size="sm"
              render={<Link href="/categories" />}
              nativeButton={false}
            >
              <LayoutGrid data-icon="inline-start" />
              Categories
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
