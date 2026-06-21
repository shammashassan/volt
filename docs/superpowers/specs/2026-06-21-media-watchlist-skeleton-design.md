# Media Watchlist Loading Skeleton Design Specification

## Overview
Align the dashboard's media watchlist loading skeleton (`app/(dashboard)/media-watchlist/loading.tsx`) to match the visual architecture and component structure of the actual watchlist page (`app/(dashboard)/media-watchlist/_components/media-watchlist-client.tsx`). This resolves visual jumps (Cumulative Layout Shift) and aligns the cards to match high-density poster layouts.

---

## Proposed Changes

### 1. Outer Container & Width bounds
- **Target File**: `app/(dashboard)/media-watchlist/loading.tsx`
- Mirror the container layout from `MediaWatchlistClient`:
  - Outer: `flex flex-1 flex-col gap-6 pb-12`
  - Max Width Constraint: `max-w-7xl` (previously `max-w-[1600px]`)
  - Padding: `px-4 lg:px-6` (previously `p-4 lg:p-8`)

### 2. Header Skeleton
- Replace simple header block with exact structure:
  - Flex container with matching spacing: `flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between`
  - Render an icon placeholder matching `h-12 w-12 rounded-xl bg-muted`
  - Render title & badge inline wrapper with matching skeleton heights.
  - Render description line with appropriate spacing.
  - Render button placeholder `h-10 w-full sm:w-28 bg-muted rounded-md shrink-0`.

### 3. Filter Toolbar Skeleton
- Replace tag layout with a single-card structure:
  - Background card wrapper: `p-4 border border-border/40 bg-card/30 backdrop-blur-sm rounded-2xl flex flex-col gap-4 lg:flex-row lg:items-center`
  - Search Input placeholder: `h-10 bg-muted/60 rounded-md flex-1 w-full`
  - Dropdown & Toggle placeholders:
    - Status Select placeholder: `h-10 w-[140px] bg-muted/60 rounded-md`
    - Type Select placeholder: `h-10 w-[140px] bg-muted/60 rounded-md`
    - Rated Toggle placeholder: `h-10 w-20 bg-muted/60 rounded-md`

### 4. Watchlist Card Grid Skeleton
- Grid Layout: `grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4`
- Card Structure:
  - Card container: `relative overflow-hidden aspect-[2/3] w-full border bg-card rounded-xl`
  - Full-height Poster skeleton inside the container.
  - Circular badge placeholders absolutely positioned at the bottom to emulate the loaded state layout:
    - Status Badge: `absolute bottom-2 left-2 h-7 w-7 rounded-full`
    - Rating Badge (simulated on ~66% of cards): `absolute bottom-2 right-2 h-7 w-10 rounded-full`

---

## Verification Plan

### Manual Verification
- Render the `loading.tsx` component directly or throttle page load in developer tools to inspect the loading state layout.
- Verify that container boundaries (`max-w-7xl`), horizontal padding (`px-4 lg:px-6`), header layout, filter inputs/buttons, and card grids match the actual page components exactly.
- Confirm there are no layout shifts or shifts in container boundaries when the watchlist items finish loading.
