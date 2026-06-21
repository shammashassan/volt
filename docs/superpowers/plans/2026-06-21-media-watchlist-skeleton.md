# Media Watchlist Loading Skeleton Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align the media watchlist page loading skeleton with the actual page elements to eliminate layout shift.

**Architecture:** We will rewrite `app/(dashboard)/media-watchlist/loading.tsx` to match the exact HTML/CSS grid layout, max-width bounds, padding, and block structures of `MediaWatchlistClient` and `WatchlistCard`, replacing interactive components with `Skeleton` primitives.

**Tech Stack:** Next.js 16 (App Router), Tailwind CSS (v4), shadcn/ui Skeleton, Lucide React icons.

---

### Task 1: Update Outer Layout & Header Skeleton

**Files:**
- Modify: [loading.tsx](file:///c:/Users/ADMIN/Desktop/shammas/website/volt/app/(dashboard)/media-watchlist/loading.tsx)

- [ ] **Step 1: Write the updated outer wrapper and header layout skeleton**
  Replace the header structure in `loading.tsx` to match the layout of the header section in `media-watchlist-client.tsx`.

  ```tsx
  import React from "react";
  import { Skeleton } from "@/components/ui/skeleton";

  export default function WatchlistLoading() {
    return (
      <div className="flex flex-1 flex-col gap-6 pb-12">
        {/* Header section */}
        <section className="px-4 pt-8 lg:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between max-w-7xl animate-pulse">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-4">
                {/* Icon box placeholder */}
                <Skeleton className="h-12 w-12 rounded-xl bg-muted/65" />
                {/* Title & Badge */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-44 bg-muted/65 rounded-md" />
                  <Skeleton className="h-6 w-16 bg-muted/65 rounded-full" />
                </div>
              </div>
              {/* Description text placeholder */}
              <Skeleton className="h-4 w-72 bg-muted/65 rounded-md mt-1" />
            </div>
            {/* Add Media Button placeholder */}
            <Skeleton className="h-10 w-full sm:w-28 bg-muted/65 rounded-md shrink-0" />
          </div>
        </section>
      </div>
    );
  }
  ```

- [ ] **Step 2: Commit progress**
  ```bash
  git add app/\(dashboard\)/media-watchlist/loading.tsx
  git commit -m "style: update outer layout and header skeleton for media watchlist"
  ```

---

### Task 2: Implement Filter Toolbar Skeleton

**Files:**
- Modify: [loading.tsx](file:///c:/Users/ADMIN/Desktop/shammas/website/volt/app/(dashboard)/media-watchlist/loading.tsx)

- [ ] **Step 1: Append the Filter Toolbar skeleton structure**
  Insert the filter toolbar below the header section in `loading.tsx`. It must mimic the glassmorphic card container with search input, two filter dropdown selects, and the rated toggle.

  Add this section block inside `WatchlistLoading` after the header `<section>`:

  ```tsx
        {/* Filter Toolbar */}
        <section className="px-4 lg:px-6">
          <div className="p-4 border border-border/40 bg-card/30 backdrop-blur-sm rounded-2xl flex flex-col gap-4 lg:flex-row lg:items-center max-w-7xl animate-pulse">
            {/* Search Input Placeholder */}
            <Skeleton className="h-10 bg-muted/60 rounded-md flex-1 w-full" />
            {/* Filter buttons/selectors */}
            <div className="flex flex-wrap gap-3 items-center w-full lg:w-auto">
              {/* Status Select */}
              <Skeleton className="h-10 w-[140px] bg-muted/60 rounded-md" />
              {/* Type Select */}
              <Skeleton className="h-10 w-[140px] bg-muted/60 rounded-md" />
              {/* Rated Toggle */}
              <Skeleton className="h-10 w-20 bg-muted/60 rounded-md" />
            </div>
          </div>
        </section>
  ```

- [ ] **Step 2: Commit progress**
  ```bash
  git add app/\(dashboard\)/media-watchlist/loading.tsx
  git commit -m "style: add filter toolbar skeleton to media watchlist"
  ```

---

### Task 3: Implement Watchlist Card Grid Skeleton

**Files:**
- Modify: [loading.tsx](file:///c:/Users/ADMIN/Desktop/shammas/website/volt/app/(dashboard)/media-watchlist/loading.tsx)

- [ ] **Step 1: Append the grid and card layout skeleton**
  Insert the grid section block below the filter toolbar section in `loading.tsx`. The cards should be absolute poster layouts with simulated status and rating badges at the bottom.

  Add this section block inside `WatchlistLoading` after the filter toolbar `<section>`:

  ```tsx
        {/* Results / List State */}
        <section className="px-4 lg:px-6">
          <div className="max-w-7xl">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {Array.from({ length: 16 }).map((_, idx) => (
                <div
                  key={idx}
                  className="relative overflow-hidden aspect-[2/3] w-full border bg-card rounded-xl"
                >
                  {/* Poster Image Skeleton */}
                  <Skeleton className="h-full w-full rounded-none" />
                  
                  {/* Bottom Badges */}
                  {/* Status icon badge */}
                  <Skeleton className="absolute bottom-2 left-2 h-7 w-7 rounded-full bg-muted/80" />
                  
                  {/* Rating value badge (rendered on ~66% of cards for realism) */}
                  {idx % 3 !== 0 && (
                    <Skeleton className="absolute bottom-2 right-2 h-7 w-10 rounded-full bg-muted/80" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
  ```

- [ ] **Step 2: Commit progress**
  ```bash
  git add app/\(dashboard\)/media-watchlist/loading.tsx
  git commit -m "style: add watchlist grid and card skeletons"
  ```

---

### Task 4: Complete and Verify Loading Page Code

**Files:**
- Modify: [loading.tsx](file:///c:/Users/ADMIN/Desktop/shammas/website/volt/app/(dashboard)/media-watchlist/loading.tsx)

- [ ] **Step 1: Verify the complete file contents of `loading.tsx`**
  Ensure the entire file is clean, lint-free, and contains the full combined layout of header, filter toolbar, and card grid:

  ```tsx
  import React from "react";
  import { Skeleton } from "@/components/ui/skeleton";

  export default function WatchlistLoading() {
    return (
      <div className="flex flex-1 flex-col gap-6 pb-12">
        {/* Header section */}
        <section className="px-4 pt-8 lg:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between max-w-7xl animate-pulse">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-4">
                {/* Icon box placeholder */}
                <Skeleton className="h-12 w-12 rounded-xl bg-muted/65" />
                {/* Title & Badge */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-44 bg-muted/65 rounded-md" />
                  <Skeleton className="h-6 w-16 bg-muted/65 rounded-full" />
                </div>
              </div>
              {/* Description text placeholder */}
              <Skeleton className="h-4 w-72 bg-muted/65 rounded-md mt-1" />
            </div>
            {/* Add Media Button placeholder */}
            <Skeleton className="h-10 w-full sm:w-28 bg-muted/65 rounded-md shrink-0" />
          </div>
        </section>

        {/* Filter Toolbar */}
        <section className="px-4 lg:px-6">
          <div className="p-4 border border-border/40 bg-card/30 backdrop-blur-sm rounded-2xl flex flex-col gap-4 lg:flex-row lg:items-center max-w-7xl animate-pulse">
            {/* Search Input Placeholder */}
            <Skeleton className="h-10 bg-muted/60 rounded-md flex-1 w-full" />
            {/* Filter buttons/selectors */}
            <div className="flex flex-wrap gap-3 items-center w-full lg:w-auto">
              {/* Status Select */}
              <Skeleton className="h-10 w-[140px] bg-muted/60 rounded-md" />
              {/* Type Select */}
              <Skeleton className="h-10 w-[140px] bg-muted/60 rounded-md" />
              {/* Rated Toggle */}
              <Skeleton className="h-10 w-20 bg-muted/60 rounded-md" />
            </div>
          </div>
        </section>

        {/* Results / List State */}
        <section className="px-4 lg:px-6">
          <div className="max-w-7xl">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {Array.from({ length: 16 }).map((_, idx) => (
                <div
                  key={idx}
                  className="relative overflow-hidden aspect-[2/3] w-full border bg-card rounded-xl"
                >
                  {/* Poster Image Skeleton */}
                  <Skeleton className="h-full w-full rounded-none" />
                  
                  {/* Bottom Badges */}
                  {/* Status icon badge */}
                  <Skeleton className="absolute bottom-2 left-2 h-7 w-7 rounded-full bg-muted/80" />
                  
                  {/* Rating value badge */}
                  {idx % 3 !== 0 && (
                    <Skeleton className="absolute bottom-2 right-2 h-7 w-10 rounded-full bg-muted/80" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }
  ```

- [ ] **Step 2: Commit final file**
  ```bash
  git add app/\(dashboard\)/media-watchlist/loading.tsx
  git commit -m "style: finalize loading skeleton structure for media watchlist"
  ```
