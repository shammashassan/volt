# Design Spec: Volt Dashboard Workspace Redesign

## Goal Description
Redesign the Volt Explore/Dashboard screen from a visual-heavy Bento grid into a structured, production-grade **Developer Workspace Home**. This transition addresses visual misalignment, poor vertical scaling of categories, low-utility cards (Inbox, generic Stats), and elevates Quick Save into a first-class citizen alongside Command Search.

---

## Proposed Layout Architecture

The new dashboard uses a **two-column layout** on desktop and a **hierarchical single-column feed** on mobile.

```text
Desktop Layout
┌───────────────────────────────────────────────┬──────────────────────────────────┐
│ Command Center (Search & Actions)             │ Quick Save (Premium Capture)     │
├───────────────────────────────────────────────┼──────────────────────────────────┤
│ Workspace Activity (Recent | Discover)        │ Workspace Health (Health/Stats)  │
├───────────────────────────────────────────────┼──────────────────────────────────┤
│ Recently Added Resources (Largest Visual)      │ Categories (Density Summary)     │
├───────────────────────────────────────────────┼──────────────────────────────────┤
│ Most Used Resources (Click Stats)             │ Favorites & Pinned (Quick Links) │
└───────────────────────────────────────────────┴──────────────────────────────────┘
```

---

## Component Refactoring

### 1. Workspace Shell (components/dashboard/workspace-bento.tsx)
*   **Change**: Rename/Refactor from a rigid grid structure into a flex/grid two-column shell.
*   **Desktop CSS**: `grid grid-cols-1 lg:grid-cols-3 gap-6`.
    *   Left Column: `lg:col-span-2 flex flex-col gap-6`
    *   Right Column: `lg:col-span-1 flex flex-col gap-6`
*   **Mobile Reordering**: Set explicit vertical stack order via Tailwind classes/layout flow.
*   **GSAP Animations**: Preserve staggered opacity and position slide-in using `gsap.matchMedia()` targeting `.bento-tile` elements.

### 2. Workspace Health & Stats (components/dashboard/stats-card.tsx)
*   **Change**: Transition from plain stats indicators to a unified **Workspace Health & Stats Card**.
*   **UI Details**:
    *   Left/Top side: Compact count summaries for Resources, Categories, and Favorites.
    *   Right/Bottom side: Inline health signals:
        *   `⚠️ X Inbox Items` (Warning alert if uncategorized count > 0)
        *   `✓ Workspace Active` (Success status indicator)
*   **Inbox Integration**: Remove `InboxCard` entirely from the grid; represent its status directly within this health card.

### 3. Workspace Categories Summary (New Widget)
*   **Change**: Do not render the full Category Explorer grid. Introduce a compact summary card `components/dashboard/categories-summary-card.tsx`.
*   **UI Details**:
    *   Displays totals (e.g., `14 Categories`, `102 Resources`).
    *   Lists the top 5 categories by resource count.
    *   Each category row renders a micro-bar chart representing the relative density of resources (using Tailwind width or vanilla CSS styles).
    *   "Manage Categories" button at the bottom linking to `/categories`.

### 4. Premium Quick Save (components/dashboard/quick-save-card.tsx)
*   **Change**: Restructure into a premium capture experience that balances speed and customization.
*   **States**:
    *   *Default*: Simple URL text input with a clear caption.
    *   *Preview*: Triggers on URL detection, showing favicon, title, and description preview. Category dropdown is rendered inline.
    *   *Advanced Toggle*: A tiny button/link to expand optional fields: custom tags input and short text area for notes/why-saved.

### 5. Workspace Activity (components/dashboard/activity-card.tsx)
*   **Change**: Simplify and consolidate the tab layout.
*   **UI Details**:
    *   Tab 1: **Recent** (calls `getRecentlyViewed` as "Continue Exploring").
    *   Tab 2: **Discover** (calls `getRecommendedResources` with a small, high-density spotlight card embedded at the top of the recommendation list if `spotlight` exists).

### 6. Most Used Resources (components/dashboard/recently-valuable.tsx)
*   **Change**: Rename card header to "Most Used Resources".
*   **Bug Fix**: Remove `justify-center` from the card content container. Force items to start immediately at the top of the container (`justify-start`), addressing the vertical misalignment.

### 7. Recently Added (components/dashboard/workspace-bento.tsx)
*   **Change**: Retain as the largest content container in the main feed to emphasize content over stats.
*   **Layout**: Displays 4 resources in a clean, modern card grid.

---

## Verification Plan
1.  **Layout Symmetry**: Verify that search card and quick save card align perfectly at the top on desktop.
2.  **Responsiveness**: Shrink the viewport to `< 1024px` and verify stacking order:
    *   Command Center $\rightarrow$ Quick Save $\rightarrow$ Activity $\rightarrow$ Recently Added $\rightarrow$ Workspace Health $\rightarrow$ Categories $\rightarrow$ Most Used $\rightarrow$ Favorites.
3.  **Categories Scaling**: Seed database with 20+ categories and ensure only the top 5 are displayed in the summary card.
4.  **Quick Save Advanced Mode**: Verify that clicking "Advanced" toggle expands tags/notes input smoothly without breaking container height.
