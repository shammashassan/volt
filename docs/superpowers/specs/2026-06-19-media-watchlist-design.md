# Media Watchlist Design Specification

## Overview
Add a dedicated, lightweight, and high-density Media Watchlist page within UI Volt's dashboard where users can track movies, series, and anime with minimal friction. The feature utilizes a server-side proxy to query TMDb and AniList concurrently, storing the media items in MongoDB, and providing an instantly responsive experience using optimistic updates.

This implementation follows Next.js 16 conventions: Server Actions are utilized for all CRUD operations, while search requests are routed through a debounced API Route Handler proxy.

---

## 1. Directory Structure
The feature is completely self-contained within the dashboard route folder to maintain strict ownership and isolate the module:

```txt
app/(dashboard)/media-watchlist/
├── page.tsx
├── loading.tsx
├── _components/
│   ├── media-watchlist-client.tsx
│   ├── watchlist-card.tsx
│   ├── add-media-dialog.tsx
│   ├── watchlist-filters.tsx
│   ├── watchlist-grid.tsx
│   └── empty-state.tsx
├── _actions/
│   ├── get-watchlist.ts
│   ├── create-watchlist-item.ts
│   ├── update-watchlist-item.ts
│   └── delete-watchlist-item.ts
├── _schemas/
│   └── watchlist.schema.ts
├── _types/
│   └── watchlist.types.ts
└── _constants/
    └── watchlist.constants.ts
```

---

## 2. Database Schema & Indexes

### Collection: `watchlist`
Each document represents a tracked media item. The collection utilizes cached metadata for fast page loads and API independence.

```typescript
export type WatchlistStatus = "planned" | "watching" | "completed" | "dropped";
export type WatchlistSource = "tmdb" | "anilist";
export type WatchlistMediaType = "movie" | "series" | "anime";

export interface WatchlistItem {
  _id?: string;
  userId: string;
  externalId: string;
  source: WatchlistSource;
  type: WatchlistMediaType;
  status: WatchlistStatus;
  rating?: number; // Optional 1-10 integer
  metadata?: {
    title: string;
    posterUrl?: string;
    releaseYear?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### Indexes
1.  **Unique constraint** on `{ userId: 1, source: 1, externalId: 1 }` (with `{ unique: true }`) to prevent duplicates.
2.  **Filter index** on `{ userId: 1, status: 1, type: 1 }` for fast query results.
3.  **Sort index** on `{ userId: 1, updatedAt: -1 }` for viewing recently updated items first.

---

## 3. Data Querying, CRUD, & Caching

### 3.1 Search API Proxy
*   **Endpoint**: `GET /api/watchlist/search`
*   **Query Params**: `q` (search string), `type` (optional filter: `movie | series | anime`)
*   **Details**:
    *   Queries the TMDb API (using `process.env.TMDB_API_KEY`) if key is configured. If key is missing, logs a warning and returns only AniList results.
    *   Queries the AniList GraphQL API (`https://graphql.anilist.co`) for anime matching the query.
    *   Normalizes and merges results.
    *   Limits search results to **10–20 best matches** to keep the command palette clean and fast.
*   **Response Shape**:
    ```typescript
    export interface SearchResult {
      externalId: string;
      source: WatchlistSource;
      type: WatchlistMediaType;
      title: string;
      posterUrl: string | null;
      releaseYear?: number;
    }
    ```

### 3.2 CRUD Actions (Server Actions)
*   **`getWatchlistAction()`**:
    *   Fetches the user's watchlist array.
    *   Derives `userId` from the authenticated session.
    *   Sorts by `updatedAt: -1` by default (with future sorting capability built in).
*   **`createWatchlistItemAction(payload)`**:
    *   Accepts `externalId`, `source`, `type`, `status` (default: `"planned"`), and `metadata`.
    *   Validates using `zod` (`createWatchlistItemSchema`).
    *   Checks for duplicate items. If it exists, returns `{ exists: true, item: existingItem }` with success.
    *   Performs database write.
    *   Revalidates cache tags.
*   **`updateWatchlistItemAction(id, payload)`**:
    *   Accepts `status` or `rating` to update.
    *   Validates using `zod`.
    *   Revalidates cache tags.
*   **`deleteWatchlistItemAction(id)`**:
    *   Deletes the item.
    *   Revalidates cache tags.

### 3.3 Cache Tag Strategy
Using Next.js cache utilities, we enforce cache boundaries from day one:
*   On read (`getWatchlistAction`):
    *   Tag: `watchlist` and `watchlist-${userId}`
*   On mutation (create, update, delete):
    *   `revalidateTag("watchlist")` and `revalidateTag("watchlist-" + userId)`

---

## 4. Frontend & User Experience

### 4.1 Routing & Navigation
*   **Path**: `/media-watchlist`
*   **Sidebar Link**:
    *   Add a single navigation item to `components/app-sidebar.tsx` labelled **"Media Watchlist"** at the top-level (under Notes, above Categories).
    *   Uses a Lucide icon (e.g. `Film`).

### 4.2 Filtering (URL State with `nuqs`)
*   Uses `nuqs` to read/write `status` and `type` filters:
    *   `status`: `"all" | "planned" | "watching" | "completed" | "dropped"` (default: `"all"`)
    *   `type`: `"all" | "movie" | "series" | "anime"` (default: `"all"`)
*   **UI layout**: Compact badge-like segmented pills/toggle controls instead of full-width tabs.

### 4.3 "Add Media" Command Dialog
*   Triggered via an **"Add Media"** button on the top-right of the page or `⌘K` / `Ctrl+K`.
*   Shows a Command Dialog (`CommandDialog` from ShadCN).
*   **Search Input**:
    *   Debounced (300ms) text field.
    *   Only searches when character length is 2 or more.
*   **States**:
    *   *Idle*: "Type to search movies, series, or anime..."
    *   *Searching*: Quiet skeleton loading rows.
    *   *Results*: Shows Poster, Title, Year, and Type Badge.
    *   *No Results*: "No media found."
    *   *Error*: "Failed to fetch search results."
*   **Interaction**: Clicking a result calls `createWatchlistItemAction`, closes the dialog, and updates the watchlist page instantly. If the item already exists, displays a toast: `"Already in your watchlist."`.

### 4.4 Dense Grid & Card Design
*   **Grid layout**:
    *   Mobile: 2 columns
    *   Tablet: 3-4 columns
    *   Desktop: 6-8 columns
    *   Density prioritized over large margins/spacing.
*   **Card Composition**:
    *   Aspect ratio `aspect-[2/3]` for the poster image.
    *   If no artwork/poster is returned, render a beautiful fallback card displaying a film slate/projector icon (`🎬` or `Film`) and the title.
    *   Compact height, title below the image.
    *   **Hover states**: Gentle `scale-[1.02]` and `translate-y-[-2px]` transitions with fast animation speed (`duration-150` to `duration-200`).
    *   **Delete icon**: Destructive trash can shown in top-right *only on hover*. Opens an AlertDialog confirmation.
    *   **Status Badge**: Clicking opens a Popover menu showing current status highlighted with a checkmark (`✓`), allowing instant updates.
    *   **Rating Badge**: Displays `8/10` or a blank indicator. Clicking opens a Popover showing a simple number array `1 2 3 4 5 6 7 8 9 10` plus a `Clear` button.
*   **Optimistic updates**: All changes (status change, rating change, delete) update the React state list immediately. Server Actions run in the background. On failure, state reverts and a toast notification is displayed.

---

## 5. UI States
*   **Loading state**: Densities matching the active grid size using skeleton cards.
*   **Empty state**: Minimal, clean screen:
    ```txt
    No media yet.
    Track movies, series, and anime in one place.
    [ Add Media ]
    ```

---

## 6. Accessibility & Motion
*   **Keyboard Navigation**: Full support for `Tab`, `Arrow Keys`, `Enter`, and `Escape` key controls within Dialogs, Popovers, and dropdown menus (leverage ShadCN primitives).
*   **Fast Transitions**: Keep CSS transitions short (`duration-150` / `duration-200`) to match premium consumer app aesthetics (e.g. Apple TV, Arc).
