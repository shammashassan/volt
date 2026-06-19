# Design Document: Media Watchlist Uniform Redesign

This document outlines the changes to bring the `/media-watchlist` page's visual layout, headers, filters, and empty states in complete visual and structural alignment with the `/resources` page.

## Purpose & Context
The `/media-watchlist` page was built with a generic layout that didn't match the premium glassmorphic, grid-based aesthetic of the `/resources` page. To ensure consistent branding and visual excellence across the dashboard workspace, we are rewriting the shell structure, header block, filters bar, and empty states of `/media-watchlist` to mirror `/resources`.

## Constraints & Requirements
- Do **not** modify `WatchlistCard` or change its styling (retaining its dedicated portrait movie poster aspect ratio and hover mechanics).
- Use the same Tailwind spacing utility classes (`px-4`, `pt-8`, `lg:px-6`) and `max-w-7xl` content width bounds to keep elements perfectly aligned.
- Transition filters from button-group rows to the premium inline glassmorphic toolbar featuring `<Select>` dropdowns, local text search, and a "Rated" toggle.

## Proposed Changes

### 1. Page Header Block
Rewrite the header layout in `app/(dashboard)/media-watchlist/_components/media-watchlist-client.tsx` to match:
- A `bg-primary/10 text-primary` container with a `Film` icon.
- A 3D/gradient page title (`text-3xl font-black md:text-4xl bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/60`).
- A tracking-widest count badge detailing the filtered media item count.
- An aligned subtitle description detailing the purpose of the watchlist, plus a keyboard shortcut note.
- An "Add Media" primary button on the right side of the flex container.

### 2. Glassmorphic Filter Toolbar
Re-implement the filter toolbar using:
- **Search Input**: Local title substring filter using `<Input>` from `@/components/ui/input` and `Search` icon.
- **Status Filter**: `<Select>` dropdown offering:
  - All Status
  - Planned
  - Watching
  - Completed
  - Dropped
- **Type Filter**: `<Select>` dropdown offering:
  - All Types
  - Movie
  - Series
  - Anime
- **Rated Filter**: A `<Toggle>` component with a `Star` icon and a label "Rated" to view rated items only.

### 3. Client State & Filtering (Nuqs integration)
Integrate local debounced text search, parsing URLs smoothly using `nuqs`.
- Filters map:
  - `q`: Search query string (local input state debounced to URL state `q`).
  - `status`: URL status string ("planned", "watching", "completed", "dropped").
  - `type`: URL type string ("movie", "series", "anime").
  - `rated`: URL boolean value.
- Item filter criteria:
  - `matchesSearch`: title matching substring of `q`.
  - `matchesStatus`: `item.status === status` (if not "all").
  - `matchesType`: `item.type === type` (if not "all").
  - `matchesRated`: `item.rating !== undefined` (if `rated` is active).

### 4. Empty States
Import `<Empty>` from `@/components/ui/empty` and implement:
- **No Items in Watchlist**: A dashed banner with `Film` icon, header title, description, and "Add Media" button.
- **No Match for Selected Filters**: A dashed banner with `Filter` icon, title, description, and "Clear Filters" button.

---

## Verification Plan

### Manual Verification
1. Load `/media-watchlist` and check layout alignment with `/resources`.
2. Confirm the header title, icon box, and count badge match `/resources` exactly.
3. Test local text search in the filter bar, verifying that typing filters existing items on-the-fly.
4. Test status and type select dropdowns.
5. Test the "Rated" toggle, checking that only rated items are shown.
6. Verify the empty states display as expected.
