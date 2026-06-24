# Category Filter with Uncategorized Option Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a category filter to the resources page, allowing users to filter by specific categories or find uncategorized resources.

**Architecture:** Sync selected category state via URL query parameters using `nuqs`. On the client side, filter resources matching either a specific category ID or "none" (uncategorized).

**Tech Stack:** Next.js, React, Tailwind CSS, shadcn/ui (Select component), `nuqs`.

---

### Task 1: Update Resource Filter Parser Config

**Files:**
- Modify: `lib/resource-filters.ts`

- [ ] **Step 1: Add category to resource filters type and parsing configuration**
  We will add the `category` property to `ResourceFilters` and `resourceFilterParsers`, and update `getResourcesPageTitle` to accept the `categories` list so it can append category name or "Uncategorized" to the page title.

  Modify `lib/resource-filters.ts` as follows:
  ```diff
  -import { createParser, parseAsString, parseAsBoolean } from 'nuqs'
  +import { createParser, parseAsString, parseAsBoolean } from 'nuqs'
   import { ResourceType, ResourceStatus } from '@/lib/types'
  +import { Category } from '@/lib/types'
   import { RESOURCE_TYPES, STATUS_OPTIONS, getResourceTypeInfo } from './resource-types'
  
   // ...
  
   export const parseResourceFavorite = parseAsBoolean
   export const parseSearchQuery = parseAsString
  +export const parseResourceCategory = parseAsString
  
   // Centralized export for useQueryStates
   export const resourceFilterParsers = {
     type: parseResourceType,
     status: parseResourceStatus,
     favorite: parseResourceFavorite,
  +  category: parseResourceCategory,
     q: parseSearchQuery,
   }
  
   export interface ResourceFilters {
     type?: ResourceType | null
     status?: ResourceStatus | null
     favorite?: boolean
  +  category?: string | null
     q?: string | null
   }
  
  -export function getResourcesPageTitle(filters: ResourceFilters): string {
  +export function getResourcesPageTitle(filters: ResourceFilters, categories?: Category[]): string {
     const parts: string[] = []
     
     if (filters.status) {
       const statusOpt = STATUS_OPTIONS.find(s => s.value === filters.status)
       if (statusOpt) {
         parts.push(statusOpt.label)
       }
     }
     
     if (filters.favorite) {
       parts.push("Starred")
     }
     
     if (filters.type) {
       const config = getResourceTypeInfo(filters.type)
       if (config) {
         parts.push(config.label)
       }
     }
  +
  +  if (filters.category) {
  +    if (filters.category === "none") {
  +      parts.push("Uncategorized")
  +    } else if (categories) {
  +      const cat = categories.find(c => (c.id || c._id?.toString()) === filters.category)
  +      if (cat) {
  +        parts.push(cat.name)
  +      }
  +    }
  +  }
     
     if (parts.length === 0) {
       return "Resources Library"
     }
     
     return `${parts.join(" ")} Resources`
   }
  ```

---

### Task 2: Implement Filter UI and Logic

**Files:**
- Modify: `app/(dashboard)/resources/resources-content.tsx`

- [ ] **Step 1: Update page title calculation and filtering logic in `resources-content.tsx`**
  Modify `resources-content.tsx` to pass `categories` to `getResourcesPageTitle` and update `filteredResources` `useMemo` to filter by `filters.category`.

  In `app/(dashboard)/resources/resources-content.tsx`:
  ```typescript
    // Replace:
    const pageTitle = getResourcesPageTitle({
      type: filterType,
      status: filterStatus,
      favorite: filterFavorite ?? undefined,
      q: searchQuery
    })

    // With:
    const pageTitle = getResourcesPageTitle({
      type: filterType,
      status: filterStatus,
      favorite: filterFavorite ?? undefined,
      category: filters.category,
      q: searchQuery
    }, categories)
  ```

  Also update the filtering code:
  ```typescript
    // Replace:
    const matchesType = !filterType || resType === filterType
    const matchesStatus = !filterStatus || resStatus === filterStatus
    const matchesFav = !filterFavorite || resFav

    return matchesSearch && matchesType && matchesStatus && matchesFav

    // With:
    const matchesType = !filterType || resType === filterType
    const matchesStatus = !filterStatus || resStatus === filterStatus
    const matchesFav = !filterFavorite || resFav

    // Category filter logic:
    // Resolve resource category id same way as in the edit form dialog.
    const rawCatId = res.categoryId || res.category || "none"
    const matchedCat = categories.find(
      (c) => (c._id?.toString() || c.id) === rawCatId || c.id === rawCatId || c._id?.toString() === rawCatId
    )
    const resolvedCatId = matchedCat ? (matchedCat.id || matchedCat._id?.toString() || "none") : "none"

    const filterCategory = filters.category
    const matchesCategory = !filterCategory || resolvedCatId === filterCategory

    return matchesSearch && matchesType && matchesStatus && matchesFav && matchesCategory
  ```
  Ensure `filters.category` is added to the dependencies array of `useMemo` for `filteredResources`.

- [ ] **Step 2: Add Category Select UI next to Type and Status**
  Add the Category dropdown in the filter bar layout (between the Status Filter and the Starred Toggle):

  ```tsx
              {/* Category Filter */}
              <Select 
                value={filters.category || "all"} 
                onValueChange={(val) => setFilters({ category: val === "all" ? null : val })}
              >
                <SelectTrigger className="w-[160px] h-10 bg-background/50 border-border/60">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="none">Uncategorized</SelectItem>
                  {categories.map((cat) => {
                    const catId = cat.id || cat._id?.toString() || ""
                    return (
                      <SelectItem key={catId} value={catId}>
                        {cat.name}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
  ```

---

### Task 3: Verification

- [ ] **Step 1: Check build and typecheck**
  Ensure there are no compilation/TypeScript errors by running typescript compilation or dev server.

- [ ] **Step 2: Manual testing**
  - Navigate to `/resources`.
  - Filter by "Uncategorized". Check that only uncategorized resources are displayed, and URL contains `?category=none`.
  - Filter by a specific category. Check that only resources from that category are shown, and URL contains `?category=<id>`.
  - Check page title changes accordingly.
