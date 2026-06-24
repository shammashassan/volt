# Design Specification: Uncategorized and Category Resource Filter

**Date:** 2026-06-24
**Topic:** Add a category filter to the resources page, supporting filtering by "Uncategorized" resources as well as specific categories.

---

## 1. Goal & Context
The user needs a way to filter resources in the resources page filter tab by category, specifically targeting resources that are **uncategorized** (i.e. not associated with any category).

Currently, resources can be edited or created with the Category field set to "Uncategorized" (which stores `none` or `undefined` in the database). However, the library page filter bar only contains filters for:
- Search query (`q`)
- Resource type (`type`)
- Resource status (`status`)
- Starred status (`favorite`)

We will add a new category dropdown filter to complete this functionality.

---

## 2. Proposed Changes

### 2.1. Filter Parser Configuration (`lib/resource-filters.ts`)
We will:
- Add `category` to the `ResourceFilters` type.
- Add `category: parseAsString` to the `resourceFilterParsers` object.
- Update `getResourcesPageTitle` to accept `categories?: Category[]` so it can include the selected category name or "Uncategorized" in the page title.

### 2.2. Filter logic and UI (`app/(dashboard)/resources/resources-content.tsx`)
We will:
- Update the page title calculation to pass `categories` to `getResourcesPageTitle`.
- Update `filteredResources` matching logic to filter by `filters.category` if it is set:
  - If `filters.category === "none"`, show resources that match no category (uncategorized).
  - If `filters.category` is a specific ID, show resources that match that category ID.
- Render a new `<Select>` component in the filter bar.
  - Placed between the Status dropdown and the Starred toggle.
  - Items:
    - `"All Categories"` (value `"all"`)
    - `"Uncategorized"` (value `"none"`)
    - List of actual categories dynamically mapped from `categories`.

---

## 3. Verification Plan

### Automated/Compilation Verification
- Ensure that the TypeScript code compiles successfully.
- Check that Next.js server actions and client page load without errors.

### Manual Verification
1. Navigate to `/resources`.
2. Observe the new "All Categories" dropdown in the filter bar.
3. Select "Uncategorized" from the dropdown. The URL should update to `/resources?category=none`, and only resources with no category should be shown.
4. Select a specific category. The URL should update to `/resources?category=<category_id>`, and only resources in that category should be shown.
5. Select "All Categories". The filter should be removed from the URL and all resources shown.
