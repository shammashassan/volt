# Watchlist Search Date Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Correct date parsing failures and JSON serialization warnings when a TMDb release year is invalid or empty in the watchlist search API proxy.

**Architecture:** Add a robust and safe `parseYear` helper function that parses a string date, checks for `NaN` or invalid results, and returns `number | undefined`. Use this helper to map the `release_date` and `first_air_date` properties of search results, replacing inline instantiations of `Date`.

**Tech Stack:** Next.js, TypeScript

---

### Task 1: Add parseYear helper and update mapping in app/api/watchlist/search/route.ts

**Files:**
- Modify: `app/api/watchlist/search/route.ts`

- [ ] **Step 1: Add the `parseYear` helper function**
  Add the following helper function at the top level (e.g., above or inside `searchTmdb`):
  ```typescript
  function parseYear(dateStr?: string): number | undefined {
    if (!dateStr) return undefined;
    const year = new Date(dateStr).getFullYear();
    return isNaN(year) ? undefined : year;
  }
  ```

- [ ] **Step 2: Replace inline Date instantiation with parseYear**
  Modify:
  ```typescript
  releaseYear: item.release_date ? new Date(item.release_date).getFullYear() : undefined,
  ```
  to:
  ```typescript
  releaseYear: parseYear(item.release_date),
  ```
  and:
  ```typescript
  releaseYear: item.first_air_date ? new Date(item.first_air_date).getFullYear() : undefined,
  ```
  to:
  ```typescript
  releaseYear: parseYear(item.first_air_date),
  ```

- [ ] **Step 3: Run linter and type-checker to verify**
  Run:
  `npm run lint`
  and:
  `npx tsc --noEmit`
  Expected: Command completes successfully with exit code 0.

- [ ] **Step 4: Commit changes**
  Run:
  `git add app/api/watchlist/search/route.ts`
  `git commit -m "fix(watchlist): add safe parseYear helper to prevent date parsing failure and JSON serialization warnings"`
