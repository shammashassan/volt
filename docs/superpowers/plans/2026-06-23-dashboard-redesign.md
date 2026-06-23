# Volt Dashboard Workspace Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transition the Volt dashboard from a rigid Bento grid layout into a production-ready, two-column developer workspace.

**Architecture:** Create a two-column grid on desktop, reorder elements on mobile to emphasize actions (Search & Quick Save), rewrite card implementations for Quick Save, Workspace Health (Stats + Inbox alert), Categories summary, and Activity (tabs: Recent & Discover + Spotlight).

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide Icons, GSAP (for exit/entrance animations).

---

### CRITICAL ARCHITECTURAL SAFEGUARD

Before modifying any file, inspect all provided dashboard components, their props, data requirements, queries, actions, types, and database functions. Adapt the implementation to the existing architecture. Do not introduce assumptions about field names, database structures, server actions, routes, or component APIs. Preserve existing functionality while improving the layout, hierarchy, responsiveness, and user experience.

---

### Task 1: Refactor Workspace Health & Stats Card

**Files:**
*   Modify: components/dashboard/stats-card.tsx

- [ ] **Step 1: Inspect existing database fields and prop types**
    Examine the existing implementation in [stats-card.tsx](file:///c:/Users/ADMIN/Desktop/shammas/website/volt/components/dashboard/stats-card.tsx) and the types defined in [types.ts](file:///c:/Users/ADMIN/Desktop/shammas/website/volt/lib/types.ts). Verify if there is any custom styling or animation parameters we must preserve.

- [ ] **Step 2: Refactor StatsCard into Workspace Health & Stats**
    Refactor the existing component in [stats-card.tsx](file:///c:/Users/ADMIN/Desktop/shammas/website/volt/components/dashboard/stats-card.tsx) to render:
    1. A stats grid block containing count summaries (Resources, Categories, Favorites).
    2. Inline workspace health indicators:
        *   If `inboxCount > 0`, render an alert banner: `⚠️ X items need organization` linking to `/resources?filter=uncategorized`
        *   Otherwise, render a positive indicator: `✓ inbox clean · workspace healthy`
        *   A small sync indicator (`Volt Synced · Recently Active`)
    Ensure existing GSAP counter animation logic is preserved.

- [ ] **Step 3: Verify execution**
    Confirm the card compiles and renders without errors.

---

### Task 2: Create Workspace Categories Summary Widget

**Files:**
*   Create: components/dashboard/categories-summary-card.tsx

- [ ] **Step 1: Inspect Category types and counts aggregation**
    Inspect `getCategoriesWithCounts` in [db.ts](file:///c:/Users/ADMIN/Desktop/shammas/website/volt/lib/db.ts) to verify the data structure returned for categories.

- [ ] **Step 2: Implement CategoriesSummaryCard**
    Create the new card component. 
    *   If `categories.length === 0`, render a clean CTA: "Create your first category &rarr;" linking to categories creation or list.
    *   Otherwise, show:
        *   Summary row of Total Categories and Total Categorized Items.
        *   Top 5 categories (sorted by `resourceCount` descending) with inline relative progress bars representing their density.
        *   A link button at the bottom to "Manage Categories" (`/categories`).

- [ ] **Step 3: Verify execution**
    Ensure categories summary card integrates with the workspace layout.

---

### Task 3: Redesign Quick Save Card (Speed-Optimized)

**Files:**
*   Modify: components/dashboard/quick-save-card.tsx

- [ ] **Step 1: Inspect existing metadata actions and saving triggers**
    Inspect [quick-save-card.tsx](file:///c:/Users/ADMIN/Desktop/shammas/website/volt/components/dashboard/quick-save-card.tsx) to understand how `addResourceAction` is invoked and how metadata fetching is handled.

- [ ] **Step 2: Refactor QuickSaveCard for URL capture and category assignment**
    Refactor the existing component in [quick-save-card.tsx](file:///c:/Users/ADMIN/Desktop/shammas/website/volt/components/dashboard/quick-save-card.tsx) to:
    1. Optimize for capture speed. Keep the initial UI to a single URL text input.
    2. Once a valid URL is input (and metadata is fetched), show the metadata preview (favicon, title, description) and an inline category dropdown (`select`).
    3. Remove notes, tags, and custom fields from the initial capture UI to maintain high-density speed.
    4. Save resource using the selected category ID and trigger `router.refresh()`.

- [ ] **Step 3: Verify execution**
    Test URL paste, metadata fetching, category selection, and resource creation.

---

### Task 4: Simplify Workspace Activity Card Tabs

**Files:**
*   Modify: components/dashboard/activity-card.tsx

- [ ] **Step 1: Inspect existing ActivityCard tabs structure**
    Review [activity-card.tsx](file:///c:/Users/ADMIN/Desktop/shammas/website/volt/components/dashboard/activity-card.tsx) to see how the tabs (Continue, Discover, Spotlight) are currently implemented.

- [ ] **Step 2: Refactor ActivityCard to merge tabs**
    Refactor the tabs inside the component:
    1. Simplify to two tabs: **Recent** (renders `recentlyViewed`) and **Discover** (renders `recommended`).
    2. Inside the **Discover** tab, if a featured `spotlight` resource exists, render it as a highlighted featured box at the very top of the recommendations list rather than a separate third tab.

---

### Task 5: Refactor "Most Used Resources" Card

**Files:**
*   Modify: components/dashboard/recently-valuable.tsx

- [ ] **Step 1: Inspect field names for click counting**
    Verify whether the click count field in the database mapping is `useCount`, `clicks`, or `viewCount`. Look at `mapResourceDoc` in [db.ts](file:///c:/Users/ADMIN/Desktop/shammas/website/volt/lib/db.ts) to verify the property name.

- [ ] **Step 2: Refactor card layout and styling**
    Refactor the component:
    1. Rename header title to **"most used resources"**.
    2. Remove `justify-center` from the card content container. Ensure items align starting from the top of the container (`justify-start`).
    3. Keep list spacing dense and ensure click counts render correctly using the correct field name.

---

### Task 6: Refactor Dashboard Workspace Layout Shell

**Files:**
*   Modify: components/dashboard/workspace-bento.tsx

- [ ] **Step 1: Refactor WorkspaceBento into Two-Column layout**
    Refactor the layout in [workspace-bento.tsx](file:///c:/Users/ADMIN/Desktop/shammas/website/volt/components/dashboard/workspace-bento.tsx):
    1. Replace the Bento grid container with a clean, responsive layout.
    2. Desktop Grid: `grid grid-cols-1 lg:grid-cols-3 gap-6`.
       * Left Column (`lg:col-span-2 flex flex-col gap-6`):
         * Command Center
         * Workspace Activity (tabs: Recent | Discover)
         * Recently Added (2x2 grid of resources)
         * Most Used Resources
       * Right Column (`lg:col-span-1 flex flex-col gap-6`):
         * Quick Save
         * Workspace Health & Stats (pass `inboxCount`)
         * Categories Summary (integrate new widget)
         * Favorites & Pinned
    3. Mobile stack ordering: Command Center $\rightarrow$ Quick Save $\rightarrow$ Workspace Activity $\rightarrow$ Recently Added $\rightarrow$ Workspace Health $\rightarrow$ Categories $\rightarrow$ Most Used $\rightarrow$ Favorites.
    4. Remove any references to the deleted `InboxCard` card file.
    5. Maintain the GSAP staggered animations on page load targeting the `.workspace-card` components.

---

### Task 7: Update Explore Route Page Layout & Skeleton

**Files:**
*   Modify: app/(dashboard)/explore/page.tsx

- [ ] **Step 1: Align WorkspaceSkeleton layout proportions**
    Refactor `WorkspaceSkeleton` in [page.tsx](file:///c:/Users/ADMIN/Desktop/shammas/website/volt/app/(dashboard)/explore/page.tsx) to mirror the two-column dashboard structure.
    * Use proportional skeleton card heights matching the actual components (e.g. activity card skeleton, quick save skeleton) to avoid layout shifts on load. Do not use random static height placeholders.
