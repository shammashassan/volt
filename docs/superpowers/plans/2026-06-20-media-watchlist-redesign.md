# Media Watchlist Uniform Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the `/media-watchlist` page's layout, headers, filters, and empty states to be fully uniform with the `/resources` page.
**Architecture:** Restructure `MediaWatchlistClient` using standard Tailwind class matching, inline the glassmorphic filter bar (with Nuqs URL states, debounced search, Select dropdowns, and a Rated toggle), and apply the standard Empty component layout.
**Tech Stack:** Next.js, React, Tailwind CSS, Nuqs, Lucide React, Shadcn UI Components.

---

### Task 1: Restructure Media Watchlist Client Page Shell & Header
We will update the client container in `media-watchlist-client.tsx` to match the spacing and header section markup of `resources-content.tsx` exactly.

**Files:**
- Modify: [media-watchlist-client.tsx](file:///c:/Users/ADMIN/Desktop/shammas/website/volt/app/(dashboard)/media-watchlist/_components/media-watchlist-client.tsx)

- [ ] **Step 1: Modify imports, state declarations, and page shell structure**
  Update the imports to include UI components (`Input`, `Select`, `Toggle`, `Badge`, `Empty`) and `lucide-react` icons. Update `MediaWatchlistClient` layout to use `<div className="flex flex-1 flex-col gap-6 pb-12">` and match the header layout of resources.
  
  ```diff
  "use client";
  
  import React, { useState, useMemo, useEffect } from "react";
  import { WatchlistItem, SearchResult, WatchlistStatus } from "../_types/watchlist.types";
  -import { WatchlistFilters } from "./watchlist-filters";
  import { WatchlistGrid } from "./watchlist-grid";
  -import { EmptyState } from "./empty-state";
  import { AddMediaDialog } from "./add-media-dialog";
  import { Button } from "@/components/ui/button";
  -import { Plus, Search } from "lucide-react";
  +import { Plus, Search, Film, Star, Filter } from "lucide-react";
  import { toast } from "sonner";
  import { useQueryState } from "nuqs";
  import { createWatchlistItemAction } from "../_actions/create-watchlist-item";
  import { updateWatchlistItemAction } from "../_actions/update-watchlist-item";
  import { deleteWatchlistItemAction } from "../_actions/delete-watchlist-item";
  import { Kbd } from "@/components/ui/kbd";
  +import { Input } from "@/components/ui/input";
  +import { Badge } from "@/components/ui/badge";
  +import { Toggle } from "@/components/ui/toggle";
  +import {
  +  Select,
  +  SelectTrigger,
  +  SelectValue,
  +  SelectContent,
  +  SelectItem,
  +} from "@/components/ui/select";
  +import {
  +  Empty,
  +  EmptyHeader,
  +  EmptyTitle,
  +  EmptyDescription,
  +  EmptyMedia,
  +} from "@/components/ui/empty";
  +import { WATCHLIST_STATUS_LABELS } from "../_constants/watchlist.constants";
  
  interface MediaWatchlistClientProps {
    initialItems: WatchlistItem[];
  }
  ```

- [ ] **Step 2: Add query states for search and rating filters**
  Add the `q` (query) state and `rated` state using `useQueryState`, and introduce debouncing logic for the local search input.
  
  ```typescript
  // In MediaWatchlistClient:
  const [statusFilter, setStatusFilter] = useQueryState("status", { defaultValue: "all" });
  const [typeFilter, setTypeFilter] = useQueryState("type", { defaultValue: "all" });
  const [q, setQ] = useQueryState("q", { defaultValue: "" });
  const [ratedFilter, setRatedFilter] = useQueryState("rated", {
    parse: (v) => v === "true",
    serialize: (v) => (v ? "true" : ""),
  });

  // Local input state to prevent typing lag
  const [searchValue, setSearchValue] = useState(q || "");

  // Debouncing search updates to URL
  useEffect(() => {
    const handler = setTimeout(() => {
      setQ(searchValue || null);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchValue, setQ]);

  // Sync local search input value if URL changes externally
  useEffect(() => {
    setSearchValue(q || "");
  }, [q]);
  ```

- [ ] **Step 3: Update filtering logic to include search query and rated toggle**
  Update the `filteredItems` memoization logic:
  
  ```typescript
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const title = (item.metadata?.title || "").toLowerCase();
      const matchesSearch = !q || title.includes(q.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || !statusFilter || item.status === statusFilter;
      const matchesType = typeFilter === "all" || !typeFilter || item.type === typeFilter;
      const matchesRated = !ratedFilter || (item.rating !== undefined && item.rating !== null);
      
      return matchesSearch && matchesStatus && matchesType && matchesRated;
    });
  }, [items, q, statusFilter, typeFilter, ratedFilter]);
  ```

- [ ] **Step 4: Rewrite JSX for Page Shell and Header**
  Replace the header block JSX to match the resources structure.
  
  ```tsx
  return (
    <div className="flex flex-1 flex-col gap-6 pb-12">
      {/* Header section */}
      <section className="px-4 pt-8 lg:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between max-w-7xl">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Film className="size-6" />
              </div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-black tracking-tight md:text-4xl bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/60">
                  Media Watchlist
                </h1>
                <Badge variant="outline" className="h-6 rounded-full border-primary/20 bg-primary/5 text-primary text-[10px] uppercase font-bold tracking-widest px-2.5">
                  {filteredItems.length} Items
                </Badge>
              </div>
            </div>
            <p className="text-lg text-muted-foreground/80 max-w-2xl font-medium">
              Track movies, series, and anime. Press <Kbd>Ctrl</Kbd>+<Kbd>M</Kbd> to search database.
            </p>
          </div>
          <Button onClick={() => setSearchOpen(true)} className="w-full sm:w-auto shrink-0 gap-2 font-bold">
            <Plus className="size-4" />
            Add Media
          </Button>
        </div>
      </section>
      
      {/* (Filters & Grid go here) */}
    </div>
  );
  ```

- [ ] **Step 5: Verify syntax and commit**
  Verify the code compiles.
  Run: `npx tsc --noEmit`
  Expected: No TypeScript compilation errors.
  Commit:
  ```bash
  git add app/(dashboard)/media-watchlist/_components/media-watchlist-client.tsx
  git commit -m "feat: restructure media watchlist client shell and header"
  ```

---

### Task 2: Implement Glassmorphic Filter Toolbar
We will add the filter toolbar matching the `/resources` page's layout and style in `media-watchlist-client.tsx`.

**Files:**
- Modify: [media-watchlist-client.tsx](file:///c:/Users/ADMIN/Desktop/shammas/website/volt/app/(dashboard)/media-watchlist/_components/media-watchlist-client.tsx)

- [ ] **Step 1: Replace WatchlistFilters call with inline filter toolbar**
  Replace `<WatchlistFilters ... />` with the inline filters section.
  
  ```tsx
      {/* Filter and search bar */}
      <section className="px-4 lg:px-6">
        <div className="p-4 border border-border/40 bg-card/30 backdrop-blur-sm rounded-2xl flex flex-col gap-4 lg:flex-row lg:items-center max-w-7xl">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search title..."
              className="pl-9 h-10 border-border/60 bg-background/50 focus-visible:ring-primary/20"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            {/* Status Filter */}
            <Select
              value={statusFilter || "all"}
              onValueChange={(val) => setStatusFilter(val === "all" ? null : val)}
            >
              <SelectTrigger className="w-[140px] h-10 bg-background/50 border-border/60">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.entries(WATCHLIST_STATUS_LABELS).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    <span className="flex items-center gap-2">
                      <span>{value.icon}</span>
                      <span>{value.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select
              value={typeFilter || "all"}
              onValueChange={(val) => setTypeFilter(val === "all" ? null : val)}
            >
              <SelectTrigger className="w-[140px] h-10 bg-background/50 border-border/60">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="movie">Movie</SelectItem>
                <SelectItem value="series">Series</SelectItem>
                <SelectItem value="anime">Anime</SelectItem>
              </SelectContent>
            </Select>

            {/* Rated Toggle */}
            <Toggle
              pressed={ratedFilter || false}
              onPressedChange={(pressed) => setRatedFilter(pressed || null)}
              variant="outline"
              className="h-10 border-border/60 bg-background/50 data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
            >
              <Star className={`size-3.5 mr-2 ${ratedFilter ? "fill-current" : ""}`} />
              <span>Rated</span>
            </Toggle>
          </div>
        </div>
      </section>
  ```

- [ ] **Step 2: Verify syntax and commit**
  Verify the code compiles.
  Run: `npx tsc --noEmit`
  Expected: No TypeScript compilation errors.
  Commit:
  ```bash
  git add app/(dashboard)/media-watchlist/_components/media-watchlist-client.tsx
  git commit -m "feat: add inline glassmorphic filter toolbar to media watchlist"
  ```

---

### Task 3: Restructure Grid & Empty States
We will apply the same `<Empty>` component style for empty lists and search results, and wrap the grid inside the layout constraints.

**Files:**
- Modify: [media-watchlist-client.tsx](file:///c:/Users/ADMIN/Desktop/shammas/website/volt/app/(dashboard)/media-watchlist/_components/media-watchlist-client.tsx)

- [ ] **Step 1: Replace grid container and empty states**
  Update the results rendering block to use sections and the custom `<Empty>` layout.
  
  ```tsx
      {/* Results / List State */}
      <section className="px-4 lg:px-6">
        <div className="max-w-7xl">
          {filteredItems.length === 0 ? (
            items.length === 0 ? (
              <Empty className="py-24 border border-dashed rounded-3xl bg-card/10">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Film />
                  </EmptyMedia>
                  <EmptyTitle>No media yet</EmptyTitle>
                  <EmptyDescription>
                    Track movies, series, and anime in one place.
                  </EmptyDescription>
                  <Button onClick={() => setSearchOpen(true)} className="mt-4" size="sm">
                    Add Media
                  </Button>
                </EmptyHeader>
              </Empty>
            ) : (
              <Empty className="py-24 border border-dashed rounded-3xl bg-card/10">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Filter />
                  </EmptyMedia>
                  <EmptyTitle>No media matches the selected filters</EmptyTitle>
                  <EmptyDescription>
                    Try resetting your filters.
                  </EmptyDescription>
                  <Button
                    variant="link"
                    className="text-xs mt-2 cursor-pointer"
                    onClick={() => {
                      setStatusFilter("all");
                      setTypeFilter("all");
                      setSearchValue("");
                      setRatedFilter(null);
                    }}
                  >
                    Clear Filters
                  </Button>
                </EmptyHeader>
              </Empty>
            )
          ) : (
            <WatchlistGrid
              items={filteredItems}
              onUpdateStatus={handleUpdateStatus}
              onUpdateRating={handleUpdateRating}
              onDelete={handleDelete}
            />
          )}
        </div>
      </section>
  ```

- [ ] **Step 2: Delete unused files**
  Delete the obsolete `empty-state.tsx` and `watchlist-filters.tsx` files.
  
  Run: `Remove-Item app/(dashboard)/media-watchlist/_components/empty-state.tsx, app/(dashboard)/media-watchlist/_components/watchlist-filters.tsx`
  
- [ ] **Step 3: Verify syntax and commit**
  Verify the code compiles and tests pass.
  Run: `npx tsc --noEmit`
  Expected: No TypeScript compilation errors.
  Commit:
  ```bash
  git add app/(dashboard)/media-watchlist/_components/media-watchlist-client.tsx
  git rm app/(dashboard)/media-watchlist/_components/empty-state.tsx app/(dashboard)/media-watchlist/_components/watchlist-filters.tsx
  git commit -m "feat: integrate empty components and remove unused files"
  ```
