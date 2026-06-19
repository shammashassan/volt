# Media Watchlist Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dedicated, lightweight, and high-density Media Watchlist page to track movies, series, and anime with TMDb/AniList API search integration, MongoDB persistence, and an instantly responsive optimistic UI.

**Architecture:** A self-contained page folder `/media-watchlist` utilizing Next.js 16 Server Actions for CRUD operations, an API Route Handler proxy for secure search fetches, and local React state with optimistic UI updates.

**Tech Stack:** Next.js 16, React 19, MongoDB, Nuqs (URL state), Zod (validation), Tailwind CSS (styling), ShadCN primitives (UI).

---

## Proposed Changes & Tasks

### Task 1: Database Indexes & Types Setup

**Files:**
- Modify: `lib/db.ts`
- Create: `app/(dashboard)/media-watchlist/_types/watchlist.types.ts`
- Create: `app/(dashboard)/media-watchlist/_constants/watchlist.constants.ts`

- [ ] **Step 1: Define types**
  Create `app/(dashboard)/media-watchlist/_types/watchlist.types.ts` with:
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
    rating?: number;
    metadata?: {
      title: string;
      posterUrl?: string;
      releaseYear?: number;
    };
    createdAt: Date;
    updatedAt: Date;
  }

  export interface SearchResult {
    externalId: string;
    source: WatchlistSource;
    type: WatchlistMediaType;
    title: string;
    posterUrl: string | null;
    releaseYear?: number;
  }
  ```

- [ ] **Step 2: Define constants**
  Create `app/(dashboard)/media-watchlist/_constants/watchlist.constants.ts` with:
  ```typescript
  import { WatchlistStatus, WatchlistMediaType } from "../_types/watchlist.types";

  export const WATCHLIST_STATUS_LABELS: Record<WatchlistStatus, { label: string; icon: string }> = {
    planned: { label: "Planned", icon: "○" },
    watching: { label: "Watching", icon: "◐" },
    completed: { label: "Completed", icon: "✓" },
    dropped: { label: "Dropped", icon: "⊘" },
  };

  export const WATCHLIST_TYPE_LABELS: Record<WatchlistMediaType, string> = {
    movie: "Movie",
    series: "Series",
    anime: "Anime",
  };
  ```

- [ ] **Step 3: Modify `lib/db.ts` to add unique, filter, and sort indexes**
  Add the indexes to `lib/db.ts` inside the `getDb()` function promise list:
  ```typescript
  // Watchlist indexes
  db.collection("watchlist").createIndex({ userId: 1, source: 1, externalId: 1 }, { unique: true }),
  db.collection("watchlist").createIndex({ userId: 1, status: 1, type: 1 }),
  db.collection("watchlist").createIndex({ userId: 1, updatedAt: -1 })
  ```

- [ ] **Step 4: Verify Compilation**
  Run: `npm run lint` or check build status.

- [ ] **Step 5: Commit changes**
  ```bash
  git add lib/db.ts app/(dashboard)/media-watchlist/_types/watchlist.types.ts app/(dashboard)/media-watchlist/_constants/watchlist.constants.ts
  git commit -m "db: add watchlist types, constants, and database indexes"
  ```

---

### Task 2: Schema Validation Setup

**Files:**
- Create: `app/(dashboard)/media-watchlist/_schemas/watchlist.schema.ts`

- [ ] **Step 1: Write schemas**
  Create `app/(dashboard)/media-watchlist/_schemas/watchlist.schema.ts` with:
  ```typescript
  import { z } from "zod";

  export const createWatchlistItemSchema = z.object({
    externalId: z.string().min(1),
    source: z.enum(["tmdb", "anilist"]),
    type: z.enum(["movie", "series", "anime"]),
    status: z.enum(["planned", "watching", "completed", "dropped"]).default("planned"),
    rating: z.number().int().min(1).max(10).optional(),
    metadata: z.object({
      title: z.string().min(1),
      posterUrl: z.string().optional(),
      releaseYear: z.number().int().optional(),
    }).optional(),
  });

  export const updateWatchlistStatusSchema = z.object({
    status: z.enum(["planned", "watching", "completed", "dropped"]),
  });

  export const updateWatchlistRatingSchema = z.object({
    rating: z.number().int().min(1).max(10).optional().nullable(),
  });
  ```

- [ ] **Step 2: Verify compilation**
  Run: `npm run lint`

- [ ] **Step 3: Commit**
  ```bash
  git add app/(dashboard)/media-watchlist/_schemas/watchlist.schema.ts
  git commit -m "schema: create zod validation schemas for watchlist operations"
  ```

---

### Task 3: CRUD Server Actions

**Files:**
- Create: `app/(dashboard)/media-watchlist/_actions/get-watchlist.ts`
- Create: `app/(dashboard)/media-watchlist/_actions/create-watchlist-item.ts`
- Create: `app/(dashboard)/media-watchlist/_actions/update-watchlist-item.ts`
- Create: `app/(dashboard)/media-watchlist/_actions/delete-watchlist-item.ts`

- [ ] **Step 1: Write `get-watchlist.ts`**
  ```typescript
  "use server";

  import { getDb, serialize } from "@/lib/db";
  import { getSessionUser } from "@/lib/auth-utils";
  import { WatchlistItem } from "../_types/watchlist.types";

  export async function getWatchlistAction(): Promise<{ success: boolean; data?: WatchlistItem[]; error?: string }> {
    try {
      const user = await getSessionUser();
      const db = await getDb();
      const items = await db
        .collection("watchlist")
        .find({ userId: user.id })
        .sort({ updatedAt: -1 })
        .toArray();

      return { success: true, data: serialize(items) };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to fetch watchlist" };
    }
  }
  ```

- [ ] **Step 2: Write `create-watchlist-item.ts`**
  ```typescript
  "use server";

  import { getDb } from "@/lib/db";
  import { getSessionUser } from "@/lib/auth-utils";
  import { revalidateTag } from "next/cache";
  import { createWatchlistItemSchema } from "../_schemas/watchlist.schema";
  import { WatchlistItem } from "../_types/watchlist.types";

  export async function createWatchlistItemAction(payload: any): Promise<{ success: boolean; exists?: boolean; data?: WatchlistItem; error?: string }> {
    try {
      const user = await getSessionUser();
      const validated = createWatchlistItemSchema.parse(payload);
      const db = await getDb();

      // Check duplicate
      const existing = await db.collection("watchlist").findOne({
        userId: user.id,
        source: validated.source,
        externalId: validated.externalId,
      });

      if (existing) {
        return { success: true, exists: true, data: existing as any };
      }

      const item: Omit<WatchlistItem, "_id"> = {
        userId: user.id,
        externalId: validated.externalId,
        source: validated.source,
        type: validated.type,
        status: validated.status,
        rating: validated.rating,
        metadata: validated.metadata,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await db.collection("watchlist").insertOne(item);
      const insertedItem: WatchlistItem = {
        ...item,
        _id: result.insertedId.toString(),
      };

      revalidateTag("watchlist");
      revalidateTag(`watchlist-${user.id}`);

      return { success: true, exists: false, data: insertedItem };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to create watchlist item" };
    }
  }
  ```

- [ ] **Step 3: Write `update-watchlist-item.ts`**
  ```typescript
  "use server";

  import { getDb } from "@/lib/db";
  import { getSessionUser } from "@/lib/auth-utils";
  import { revalidateTag } from "next/cache";
  import { ObjectId } from "mongodb";
  import { updateWatchlistStatusSchema, updateWatchlistRatingSchema } from "../_schemas/watchlist.schema";

  export async function updateWatchlistItemAction(id: string, payload: any): Promise<{ success: boolean; error?: string }> {
    try {
      const user = await getSessionUser();
      const db = await getDb();

      // Check ownership
      const existing = await db.collection("watchlist").findOne({
        _id: new ObjectId(id),
        userId: user.id,
      });

      if (!existing) {
        return { success: false, error: "Watchlist item not found" };
      }

      let updateData: any = { updatedAt: new Date() };

      if ("status" in payload) {
        const validated = updateWatchlistStatusSchema.parse(payload);
        updateData.status = validated.status;
      }

      if ("rating" in payload) {
        const validated = updateWatchlistRatingSchema.parse(payload);
        updateData.rating = validated.rating === null ? undefined : validated.rating;
      }

      await db.collection("watchlist").updateOne(
        { _id: new ObjectId(id) },
        { [updateData.rating === undefined && "rating" in payload ? "$unset" : "$set"]: updateData.rating === undefined && "rating" in payload ? { rating: "" } : updateData }
      );
      if (updateData.status || updateData.rating !== undefined) {
        await db.collection("watchlist").updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );
      }

      revalidateTag("watchlist");
      revalidateTag(`watchlist-${user.id}`);

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to update item" };
    }
  }
  ```

- [ ] **Step 4: Write `delete-watchlist-item.ts`**
  ```typescript
  "use server";

  import { getDb } from "@/lib/db";
  import { getSessionUser } from "@/lib/auth-utils";
  import { revalidateTag } from "next/cache";
  import { ObjectId } from "mongodb";

  export async function deleteWatchlistItemAction(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const user = await getSessionUser();
      const db = await getDb();

      const result = await db.collection("watchlist").deleteOne({
        _id: new ObjectId(id),
        userId: user.id,
      });

      if (result.deletedCount === 0) {
        return { success: false, error: "Item not found or unauthorized" };
      }

      revalidateTag("watchlist");
      revalidateTag(`watchlist-${user.id}`);

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to delete item" };
    }
  }
  ```

- [ ] **Step 5: Verify build & lint**
  Run: `npm run lint`

- [ ] **Step 6: Commit**
  ```bash
  git add app/(dashboard)/media-watchlist/_actions/*.ts
  git commit -m "actions: add server actions for watchlist CRUD operations"
  ```

---

### Task 4: API Proxy Route for Search

**Files:**
- Create: `app/api/watchlist/search/route.ts`

- [ ] **Step 1: Write Route Handler**
  Create `app/api/watchlist/search/route.ts`:
  ```typescript
  import { NextRequest, NextResponse } from "next/server";
  import { getSessionUser } from "@/lib/auth-utils";
  import { SearchResult } from "@/app/(dashboard)/media-watchlist/_types/watchlist.types";

  export async function GET(req: NextRequest) {
    try {
      // Validate session
      await getSessionUser();

      const searchParams = req.nextUrl.searchParams;
      const query = searchParams.get("q") || "";
      const filterType = searchParams.get("type") || "all";

      if (query.trim().length < 2) {
        return NextResponse.json({ results: [] });
      }

      const promises: Promise<SearchResult[]>[] = [];
      const warnings: string[] = [];

      // TMDb search (Movies & Series)
      const tmdbKey = process.env.TMDB_API_KEY || "";
      const tmdbToken = process.env.TMDB_READ_TOKEN || "";

      if (filterType === "all" || filterType === "movie" || filterType === "series") {
        if (tmdbKey || tmdbToken) {
          promises.push(
            (async () => {
              try {
                const url = `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`;
                const headers: HeadersInit = {};
                if (tmdbToken) {
                  headers["Authorization"] = `Bearer ${tmdbToken}`;
                } else if (tmdbKey) {
                  // Fallback query param for key
                  return fetchTmdbWithKey(query, tmdbKey);
                }

                const res = await fetch(url, { headers });
                if (!res.ok) throw new Error("TMDB Response Error");
                const data = await res.json();
                
                const results: SearchResult[] = [];
                for (const item of data.results || []) {
                  if (item.media_type === "movie" && (filterType === "all" || filterType === "movie")) {
                    results.push({
                      externalId: item.id.toString(),
                      source: "tmdb",
                      type: "movie",
                      title: item.title || item.original_title,
                      posterUrl: item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : null,
                      releaseYear: item.release_date ? new Date(item.release_date).getFullYear() : undefined,
                    });
                  } else if (item.media_type === "tv" && (filterType === "all" || filterType === "series")) {
                    results.push({
                      externalId: item.id.toString(),
                      source: "tmdb",
                      type: "series",
                      title: item.name || item.original_name,
                      posterUrl: item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : null,
                      releaseYear: item.first_air_date ? new Date(item.first_air_date).getFullYear() : undefined,
                    });
                  }
                }
                return results;
              } catch (err) {
                console.error("TMDB fetch error:", err);
                warnings.push("TMDb unavailable");
                return [];
              }
            })()
          );
        } else {
          warnings.push("TMDb API key not configured");
        }
      }

      // AniList search (Anime)
      if (filterType === "all" || filterType === "anime") {
        promises.push(
          (async () => {
            try {
              const queryStr = `
                query ($search: String) {
                  Page(page: 1, perPage: 15) {
                    media(search: $search, type: ANIME) {
                      id
                      title {
                        english
                        romaji
                        native
                      }
                      coverImage {
                        large
                      }
                      startDate {
                        year
                      }
                    }
                  }
                }
              `;
              const response = await fetch("https://graphql.anilist.co", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
                body: JSON.stringify({
                  query: queryStr,
                  variables: { search: query },
                }),
              });

              if (!response.ok) throw new Error("AniList Response Error");
              const data = await response.json();
              const results: SearchResult[] = [];
              for (const media of data.data?.Page?.media || []) {
                results.push({
                  externalId: media.id.toString(),
                  source: "anilist",
                  type: "anime",
                  title: media.title.english || media.title.romaji || media.title.native,
                  posterUrl: media.coverImage.large || null,
                  releaseYear: media.startDate?.year || undefined,
                });
              }
              return results;
            } catch (err) {
              console.error("AniList fetch error:", err);
              warnings.push("AniList unavailable");
              return [];
            }
          })()
        );
      }

      const allResultsLists = await Promise.all(promises);
      const mergedResults = allResultsLists.flat();

      // Sort and truncate to a max of 20 results
      const truncatedResults = mergedResults.slice(0, 20);

      return NextResponse.json({
        results: truncatedResults,
        warnings: warnings.length > 0 ? warnings : undefined,
      });
    } catch (error: any) {
      return NextResponse.json({ error: error.message || "Internal Search Error" }, { status: 500 });
    }
  }

  async function fetchTmdbWithKey(query: string, key: string): Promise<SearchResult[]> {
    const url = `https://api.themoviedb.org/3/search/multi?api_key=${key}&query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("TMDB API Key Request Failed");
    const data = await res.json();
    const results: SearchResult[] = [];
    for (const item of data.results || []) {
      if (item.media_type === "movie") {
        results.push({
          externalId: item.id.toString(),
          source: "tmdb",
          type: "movie",
          title: item.title || item.original_title,
          posterUrl: item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : null,
          releaseYear: item.release_date ? new Date(item.release_date).getFullYear() : undefined,
        });
      } else if (item.media_type === "tv") {
        results.push({
          externalId: item.id.toString(),
          source: "tmdb",
          type: "series",
          title: item.name || item.original_name,
          posterUrl: item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : null,
          releaseYear: item.first_air_date ? new Date(item.first_air_date).getFullYear() : undefined,
        });
      }
    }
    return results;
  }
  ```

- [ ] **Step 2: Verify Compilation**
  Run: `npm run lint`

- [ ] **Step 3: Commit**
  ```bash
  git add app/api/watchlist/search/route.ts
  git commit -m "api: add TMDb/AniList search proxy route handler"
  ```

---

### Task 5: Component Implementations (UI Components)

**Files:**
- Create: `app/(dashboard)/media-watchlist/_components/empty-state.tsx`
- Create: `app/(dashboard)/media-watchlist/_components/watchlist-card.tsx`
- Create: `app/(dashboard)/media-watchlist/_components/watchlist-filters.tsx`
- Create: `app/(dashboard)/media-watchlist/_components/add-media-dialog.tsx`
- Create: `app/(dashboard)/media-watchlist/_components/watchlist-grid.tsx`

- [ ] **Step 1: Write `empty-state.tsx`**
  ```typescript
  import React from "react";
  import { Button } from "@/components/ui/button";
  import { Film } from "lucide-react";

  interface EmptyStateProps {
    onAddMedia: () => void;
  }

  export function EmptyState({ onAddMedia }: EmptyStateProps) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-2xl h-80 bg-card select-none">
        <Film className="h-10 w-10 text-muted-foreground/60 mb-4 stroke-[1.5]" />
        <h3 className="font-semibold text-lg">No media yet.</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-[280px]">
          Track movies, series, and anime in one place.
        </p>
        <Button onClick={onAddMedia} className="mt-6" size="sm">
          Add Media
        </Button>
      </div>
    );
  }
  ```

- [ ] **Step 2: Write `watchlist-card.tsx`**
  ```typescript
  "use client";

  import React, { useState } from "react";
  import { WatchlistItem, WatchlistStatus } from "../_types/watchlist.types";
  import { Card } from "@/components/ui/card";
  import { Badge } from "@/components/ui/badge";
  import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
  import { Film, Trash2, Check } from "lucide-react";
  import { cn } from "@/lib/utils";
  import { WATCHLIST_STATUS_LABELS } from "../_constants/watchlist.constants";
  import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
  } from "@/components/ui/alert-dialog";

  interface WatchlistCardProps {
    item: WatchlistItem;
    onUpdateStatus: (id: string, status: WatchlistStatus) => void;
    onUpdateRating: (id: string, rating: number | null) => void;
    onDelete: (id: string) => void;
  }

  export function WatchlistCard({ item, onUpdateStatus, onUpdateRating, onDelete }: WatchlistCardProps) {
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [statusPopoverOpen, setStatusPopoverOpen] = useState(false);
    const [ratingPopoverOpen, setRatingPopoverOpen] = useState(false);

    const activeStatus = WATCHLIST_STATUS_LABELS[item.status];

    return (
      <>
        <Card className="group relative overflow-hidden flex flex-col border bg-card hover:bg-accent/10 transition-all duration-200 ease-in-out scale-100 hover:scale-[1.02] hover:-translate-y-[2px] shadow-sm select-none">
          {/* Delete Action Overlay on Hover */}
          <button
            onClick={() => setDeleteOpen(true)}
            aria-label="Delete media item"
            className="absolute top-2 right-2 p-1.5 rounded-md bg-background/80 hover:bg-destructive hover:text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-25 border border-border"
          >
            <Trash2 className="h-4 w-4" />
          </button>

          {/* Poster Section */}
          <div className="relative aspect-[2/3] w-full bg-muted/30 overflow-hidden border-b">
            {item.metadata?.posterUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.metadata.posterUrl}
                alt={item.metadata.title}
                className="object-cover w-full h-full transition-transform duration-200 ease-in-out group-hover:scale-[1.03]"
                loading="lazy"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full w-full bg-muted/40 text-muted-foreground/50 p-4">
                <Film className="h-8 w-8 stroke-[1.25] mb-2" />
                <span className="text-[11px] text-center font-medium leading-tight max-w-[80%]">
                  {item.metadata?.title || "No Title"}
                </span>
              </div>
            )}

            {/* Type Overlay */}
            <Badge variant="secondary" className="absolute bottom-2 left-2 text-[10px] py-0 px-1.5 font-semibold bg-background/70 backdrop-blur-xs select-none">
              {item.type === "movie" ? "Movie" : item.type === "series" ? "Series" : "Anime"}
            </Badge>
          </div>

          {/* Details Section */}
          <div className="p-3 flex flex-col flex-1 gap-2">
            <h4 className="font-semibold text-xs leading-snug line-clamp-1 group-hover:text-primary transition-colors">
              {item.metadata?.title || "Unknown Media"}
            </h4>

            {/* Interactive Actions Grid */}
            <div className="flex items-center gap-1.5 mt-auto pt-0.5">
              {/* Status Selector Popover */}
              <Popover open={statusPopoverOpen} onOpenChange={setStatusPopoverOpen}>
                <PopoverTrigger asChild>
                  <button
                    aria-label="Change status"
                    className="flex-1 text-[11px] h-7 font-medium px-2 py-0.5 rounded-md border bg-background hover:bg-accent text-left transition-colors flex items-center justify-between overflow-hidden"
                  >
                    <span className="truncate">{activeStatus.label}</span>
                    <span className="text-[10px] text-muted-foreground ml-1">{activeStatus.icon}</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-36 p-1" align="start">
                  {(Object.keys(WATCHLIST_STATUS_LABELS) as WatchlistStatus[]).map((statusKey) => {
                    const option = WATCHLIST_STATUS_LABELS[statusKey];
                    const isSelected = item.status === statusKey;
                    return (
                      <button
                        key={statusKey}
                        onClick={() => {
                          onUpdateStatus(item._id!, statusKey);
                          setStatusPopoverOpen(false);
                        }}
                        className={cn(
                          "w-full text-left text-xs px-2.5 py-1.5 rounded-sm flex items-center justify-between hover:bg-accent hover:text-accent-foreground transition-colors",
                          isSelected && "font-semibold text-primary bg-accent/30"
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-[10px]">{option.icon}</span>
                          {option.label}
                        </span>
                        {isSelected && <Check className="h-3 w-3" />}
                      </button>
                    );
                  })}
                </PopoverContent>
              </Popover>

              {/* Rating Selector Popover */}
              <Popover open={ratingPopoverOpen} onOpenChange={setRatingPopoverOpen}>
                <PopoverTrigger asChild>
                  <button
                    aria-label="Change rating"
                    className={cn(
                      "text-[11px] h-7 px-2 font-medium rounded-md border transition-colors flex items-center justify-center min-w-10 hover:bg-accent",
                      item.rating ? "bg-accent/40 border-accent-foreground/20 text-foreground" : "bg-background text-muted-foreground"
                    )}
                  >
                    {item.rating ? `${item.rating}/10` : "-/10"}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2" align="end">
                  <div className="grid grid-cols-5 gap-1">
                    {Array.from({ length: 10 }).map((_, idx) => {
                      const num = idx + 1;
                      const isSelected = item.rating === num;
                      return (
                        <button
                          key={num}
                          onClick={() => {
                            onUpdateRating(item._id!, num);
                            setRatingPopoverOpen(false);
                          }}
                          className={cn(
                            "h-7 w-7 text-xs rounded-md border flex items-center justify-center font-medium transition-colors hover:bg-primary hover:text-primary-foreground",
                            isSelected ? "bg-primary text-primary-foreground font-bold" : "bg-background"
                          )}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
                  {item.rating && (
                    <button
                      onClick={() => {
                        onUpdateRating(item._id!, null);
                        setRatingPopoverOpen(false);
                      }}
                      className="w-full text-center text-xs mt-2 py-1 border border-dashed rounded-md hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    >
                      Clear Rating
                    </button>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove <strong>{item.metadata?.title}</strong> from your watchlist.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  onDelete(item._id!);
                  setDeleteOpen(false);
                }}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }
  ```

- [ ] **Step 3: Write `watchlist-filters.tsx`**
  ```typescript
  "use client";

  import React from "react";
  import { WatchlistStatus, WatchlistMediaType } from "../_types/watchlist.types";
  import { WATCHLIST_STATUS_LABELS } from "../_constants/watchlist.constants";
  import { cn } from "@/lib/utils";

  interface WatchlistFiltersProps {
    currentStatus: string;
    currentType: string;
    onStatusChange: (status: string) => void;
    onTypeChange: (type: string) => void;
  }

  export function WatchlistFilters({
    currentStatus,
    currentType,
    onStatusChange,
    onTypeChange,
  }: WatchlistFiltersProps) {
    const statuses: { value: string; label: string; icon?: string }[] = [
      { value: "all", label: "All" },
      ...(Object.keys(WATCHLIST_STATUS_LABELS) as WatchlistStatus[]).map((key) => ({
        value: key,
        label: WATCHLIST_STATUS_LABELS[key].label,
        icon: WATCHLIST_STATUS_LABELS[key].icon,
      })),
    ];

    const types = [
      { value: "all", label: "All" },
      { value: "movie", label: "Movies" },
      { value: "series", label: "Series" },
      { value: "anime", label: "Anime" },
    ];

    return (
      <div className="flex flex-col gap-4 border-b pb-4 mb-6">
        {/* Status Filter */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Status</span>
          <div className="flex flex-wrap gap-1">
            {statuses.map((s) => {
              const active = currentStatus === s.value;
              return (
                <button
                  key={s.value}
                  onClick={() => onStatusChange(s.value)}
                  className={cn(
                    "text-xs h-7 px-3 py-1 rounded-full border transition-all duration-150 flex items-center gap-1.5 select-none",
                    active
                      ? "bg-primary border-primary text-primary-foreground font-semibold"
                      : "bg-background border-border text-muted-foreground hover:text-foreground hover:bg-accent/40"
                  )}
                >
                  {s.icon && <span className="text-[10px]">{s.icon}</span>}
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Media Type Filter */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Type</span>
          <div className="flex flex-wrap gap-1">
            {types.map((t) => {
              const active = currentType === t.value;
              return (
                <button
                  key={t.value}
                  onClick={() => onTypeChange(t.value)}
                  className={cn(
                    "text-xs h-7 px-3 py-1 rounded-full border transition-all duration-150 select-none",
                    active
                      ? "bg-primary border-primary text-primary-foreground font-semibold"
                      : "bg-background border-border text-muted-foreground hover:text-foreground hover:bg-accent/40"
                  )}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 4: Write `add-media-dialog.tsx`**
  ```typescript
  "use client";

  import React, { useState, useEffect, useRef } from "react";
  import {
    CommandDialog,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
  } from "@/components/ui/command";
  import { SearchResult, WatchlistMediaType } from "../_types/watchlist.types";
  import { Film } from "lucide-react";
  import { Badge } from "@/components/ui/badge";

  interface AddMediaDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (result: SearchResult) => void;
  }

  export function AddMediaDialog({ open, onOpenChange, onSelect }: AddMediaDialogProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Keyboard shortcut watcher (⌘K or Ctrl+K)
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          onOpenChange(true);
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onOpenChange]);

    useEffect(() => {
      if (!open) {
        setQuery("");
        setResults([]);
        setLoading(false);
        setError(null);
        return;
      }
    }, [open]);

    // Handle Search Queries with Debounce
    const handleQueryChange = (val: string) => {
      setQuery(val);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      if (val.trim().length < 2) {
        setResults([]);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      debounceTimerRef.current = setTimeout(async () => {
        try {
          const res = await fetch(`/api/watchlist/search?q=${encodeURIComponent(val)}`);
          if (!res.ok) throw new Error("Search request failed");
          const data = await res.json();
          setResults(data.results || []);
        } catch (err: any) {
          setError(err.message || "Failed to search.");
        } finally {
          setLoading(false);
        }
      }, 300);
    };

    return (
      <CommandDialog open={open} onOpenChange={onOpenChange}>
        <CommandInput
          placeholder="Search movies, series, anime..."
          value={query}
          onValueChange={handleQueryChange}
        />
        <CommandList className="max-h-[380px] overflow-y-auto">
          {loading && (
            <div className="p-4 space-y-3">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="flex gap-3 items-center animate-pulse">
                  <div className="h-12 w-8 bg-muted rounded" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3.5 bg-muted rounded w-2/3" />
                    <div className="h-2.5 bg-muted rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && error && <div className="p-4 text-center text-sm text-destructive">{error}</div>}

          {!loading && !error && query.trim().length >= 2 && results.length === 0 && (
            <CommandEmpty>No media found.</CommandEmpty>
          )}

          {!loading && !error && query.trim().length < 2 && (
            <div className="p-4 text-center text-sm text-muted-foreground select-none">
              Type to search movies, series, or anime...
            </div>
          )}

          {!loading && !error && results.length > 0 && (
            <CommandGroup heading="Results">
              {results.map((item) => (
                <CommandItem
                  key={`${item.source}-${item.externalId}`}
                  value={`${item.title} ${item.releaseYear || ""}`}
                  onSelect={() => onSelect(item)}
                  className="cursor-pointer p-2 flex items-center gap-3 hover:bg-accent/40 rounded-md transition-colors"
                >
                  <div className="relative h-12 w-8 bg-muted/40 rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {item.posterUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.posterUrl} alt={item.title} className="object-cover h-full w-full" />
                    ) : (
                      <Film className="h-4 w-4 text-muted-foreground/50 stroke-[1]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs leading-tight truncate">{item.title}</span>
                      {item.releaseYear && (
                        <span className="text-[10px] text-muted-foreground flex-shrink-0">({item.releaseYear})</span>
                      )}
                    </div>
                    <div className="flex gap-1.5 mt-1">
                      <Badge variant="outline" className="text-[9px] py-0 px-1 font-semibold uppercase">
                        {item.type === "movie" ? "Movie" : item.type === "series" ? "Series" : "Anime"}
                      </Badge>
                      <Badge variant="outline" className="text-[9px] py-0 px-1 font-semibold uppercase tracking-wider bg-accent/20 border-accent-foreground/10 text-muted-foreground">
                        {item.source === "tmdb" ? "TMDb" : "AniList"}
                      </Badge>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    );
  }
  ```

- [ ] **Step 5: Write `watchlist-grid.tsx`**
  ```typescript
  import React from "react";
  import { WatchlistItem, WatchlistStatus } from "../_types/watchlist.types";
  import { WatchlistCard } from "./watchlist-card";

  interface WatchlistGridProps {
    items: WatchlistItem[];
    onUpdateStatus: (id: string, status: WatchlistStatus) => void;
    onUpdateRating: (id: string, rating: number | null) => void;
    onDelete: (id: string) => void;
  }

  export function WatchlistGrid({ items, onUpdateStatus, onUpdateRating, onDelete }: WatchlistGridProps) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {items.map((item) => (
          <WatchlistCard
            key={item._id}
            item={item}
            onUpdateStatus={onUpdateStatus}
            onUpdateRating={onUpdateRating}
            onDelete={onDelete}
          />
        ))}
      </div>
    );
  }
  ```

- [ ] **Step 6: Verify Build & Lint**
  Run: `npm run lint`

- [ ] **Step 7: Commit**
  ```bash
  git add app/(dashboard)/media-watchlist/_components/*.tsx
  git commit -m "components: implement UI components for Media Watchlist"
  ```

---

### Task 6: Main Client & Page Orchestration

**Files:**
- Create: `app/(dashboard)/media-watchlist/_components/media-watchlist-client.tsx`
- Create: `app/(dashboard)/media-watchlist/page.tsx`
- Create: `app/(dashboard)/media-watchlist/loading.tsx`

- [ ] **Step 1: Implement `media-watchlist-client.tsx` with Optimistic UI updates**
  Create `app/(dashboard)/media-watchlist/_components/media-watchlist-client.tsx`:
  ```typescript
  "use client";

  import React, { useState } from "react";
  import { WatchlistItem, SearchResult, WatchlistStatus } from "../_types/watchlist.types";
  import { WatchlistFilters } from "./watchlist-filters";
  import { WatchlistGrid } from "./watchlist-grid";
  import { EmptyState } from "./empty-state";
  import { AddMediaDialog } from "./add-media-dialog";
  import { Button } from "@/components/ui/button";
  import { Plus, Search } from "lucide-react";
  import { toast } from "sonner";
  import { useQueryState } from "nuqs";
  import { createWatchlistItemAction } from "../_actions/create-watchlist-item";
  import { updateWatchlistItemAction } from "../_actions/update-watchlist-item";
  import { deleteWatchlistItemAction } from "../_actions/delete-watchlist-item";

  interface MediaWatchlistClientProps {
    initialItems: WatchlistItem[];
  }

  export function MediaWatchlistClient({ initialItems }: MediaWatchlistClientProps) {
    const [items, setItems] = useState<WatchlistItem[]>(initialItems);
    const [searchOpen, setSearchOpen] = useState(false);

    // URL State Filters (Nuqs)
    const [statusFilter, setStatusFilter] = useQueryState("status", { defaultValue: "all" });
    const [typeFilter, setTypeFilter] = useQueryState("type", { defaultValue: "all" });

    // Filter Logic
    const filteredItems = items.filter((item) => {
      const matchStatus = statusFilter === "all" || item.status === statusFilter;
      const matchType = typeFilter === "all" || item.type === typeFilter;
      return matchStatus && matchType;
    });

    // 1. Add Media Handlers
    const handleAddMedia = async (result: SearchResult) => {
      setSearchOpen(false);

      // Duplicate Local Check
      const isDuplicate = items.some(
        (i) => i.source === result.source && i.externalId === result.externalId
      );
      if (isDuplicate) {
        toast.info("Already in your watchlist.");
        return;
      }

      // Optimistic Add
      const tempId = `temp-${Date.now()}`;
      const optimisticItem: WatchlistItem = {
        _id: tempId,
        userId: "temporary",
        externalId: result.externalId,
        source: result.source,
        type: result.type,
        status: "planned",
        metadata: {
          title: result.title,
          posterUrl: result.posterUrl || undefined,
          releaseYear: result.releaseYear,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setItems((prev) => [optimisticItem, ...prev]);
      toast.success(`Staged "${result.title}"`);

      // Server Request
      const res = await createWatchlistItemAction({
        externalId: result.externalId,
        source: result.source,
        type: result.type,
        status: "planned",
        metadata: optimisticItem.metadata,
      });

      if (!res.success) {
        setItems((prev) => prev.filter((i) => i._id !== tempId));
        toast.error(res.error || "Failed to add item.");
      } else if (res.exists) {
        // Remove temp and place existing in local list if not there
        setItems((prev) => {
          const filtered = prev.filter((i) => i._id !== tempId);
          if (filtered.some((i) => i._id === res.data?._id)) return filtered;
          return [res.data!, ...filtered];
        });
        toast.info("Already in your watchlist.");
      } else {
        // Swap temp with actual DB inserted item
        setItems((prev) => prev.map((i) => (i._id === tempId ? res.data! : i)));
        toast.success(`Added "${result.title}" to watchlist`);
      }
    };

    // 2. Update Status Handlers
    const handleUpdateStatus = async (id: string, status: WatchlistStatus) => {
      // Optimistic Update
      const oldItems = [...items];
      setItems((prev) =>
        prev.map((i) => (i._id === id ? { ...i, status, updatedAt: new Date() } : i))
      );

      const res = await updateWatchlistItemAction(id, { status });
      if (!res.success) {
        setItems(oldItems);
        toast.error(res.error || "Failed to update status.");
      } else {
        toast.success(`Updated status`);
      }
    };

    // 3. Update Rating Handlers
    const handleUpdateRating = async (id: string, rating: number | null) => {
      const oldItems = [...items];
      setItems((prev) =>
        prev.map((i) => (i._id === id ? { ...i, rating: rating ?? undefined, updatedAt: new Date() } : i))
      );

      const res = await updateWatchlistItemAction(id, { rating });
      if (!res.success) {
        setItems(oldItems);
        toast.error(res.error || "Failed to update rating.");
      } else {
        toast.success(rating ? `Rated ${rating}/10` : "Cleared rating");
      }
    };

    // 4. Delete Handlers
    const handleDelete = async (id: string) => {
      const oldItems = [...items];
      const targetItem = items.find((i) => i._id === id);
      setItems((prev) => prev.filter((i) => i._id !== id));

      const res = await deleteWatchlistItemAction(id);
      if (!res.success) {
        setItems(oldItems);
        toast.error(res.error || "Failed to delete item.");
      } else {
        toast.success(`Deleted "${targetItem?.metadata?.title || "item"}"`);
      }
    };

    return (
      <div className="flex-1 space-y-6 p-4 lg:p-8 max-w-[1600px] mx-auto w-full">
        {/* Header Block */}
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Media Watchlist</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Track movies, series, and anime. Press{" "}
              <kbd className="pointer-events-none inline-flex h-4 select-none items-center gap-1 rounded border bg-muted px-1 font-mono text-[9px] font-medium text-muted-foreground shadow-xs">
                <span>⌘</span>K
              </kbd>{" "}
              to search.
            </p>
          </div>
          <Button onClick={() => setSearchOpen(true)} className="gap-2 shrink-0" size="sm">
            <Plus className="h-4 w-4" />
            Add Media
          </Button>
        </div>

        {/* Filter Toolbar */}
        <WatchlistFilters
          currentStatus={statusFilter}
          currentType={typeFilter}
          onStatusChange={setStatusFilter}
          onTypeChange={setTypeFilter}
        />

        {/* Results / List State */}
        {filteredItems.length === 0 ? (
          items.length === 0 ? (
            <EmptyState onAddMedia={() => setSearchOpen(true)} />
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center border rounded-2xl h-60 bg-muted/20 select-none">
              <Search className="h-8 w-8 text-muted-foreground/50 mb-2 stroke-[1.5]" />
              <p className="text-xs text-muted-foreground">No media matches the selected filters.</p>
              <Button
                variant="link"
                className="text-xs mt-2"
                onClick={() => {
                  setStatusFilter("all");
                  setTypeFilter("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )
        ) : (
          <WatchlistGrid
            items={filteredItems}
            onUpdateStatus={handleUpdateStatus}
            onUpdateRating={handleUpdateRating}
            onDelete={handleDelete}
          />
        )}

        {/* Command Search Dialog */}
        <AddMediaDialog open={searchOpen} onOpenChange={setSearchOpen} onSelect={handleAddMedia} />
      </div>
    );
  }
  ```

- [ ] **Step 2: Create Page Routing `page.tsx`**
  Create `app/(dashboard)/media-watchlist/page.tsx`:
  ```typescript
  import React from "react";
  import { getWatchlistAction } from "./_actions/get-watchlist";
  import { MediaWatchlistClient } from "./_components/media-watchlist-client";
  import { Metadata } from "next";

  export const metadata: Metadata = {
    title: "Media Watchlist - Volt",
    description: "Track movies, series, and anime in one place.",
  };

  export default async function MediaWatchlistPage() {
    const res = await getWatchlistAction();
    const initialItems = res.success && res.data ? res.data : [];

    return <MediaWatchlistClient initialItems={initialItems} />;
  }
  ```

- [ ] **Step 3: Create Skeleton Loader page `loading.tsx`**
  Create `app/(dashboard)/media-watchlist/loading.tsx`:
  ```typescript
  import React from "react";
  import { Skeleton } from "@/components/ui/skeleton";

  export default function WatchlistLoading() {
    return (
      <div className="flex-1 space-y-6 p-4 lg:p-8 max-w-[1600px] mx-auto w-full">
        {/* Header Block Loader */}
        <div className="flex items-center justify-between border-b pb-4 animate-pulse">
          <div className="space-y-1">
            <div className="h-7 w-48 bg-muted rounded-md" />
            <div className="h-4.5 w-64 bg-muted rounded-sm" />
          </div>
          <div className="h-8 w-24 bg-muted rounded-md" />
        </div>

        {/* Filters Loader */}
        <div className="flex flex-col gap-4 border-b pb-4 mb-6">
          <div className="space-y-1.5">
            <div className="h-3 w-10 bg-muted rounded" />
            <div className="flex gap-2">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="h-7 w-16 bg-muted rounded-full" />
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="h-3 w-10 bg-muted rounded" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="h-7 w-16 bg-muted rounded-full" />
              ))}
            </div>
          </div>
        </div>

        {/* Grid Loader */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {Array.from({ length: 16 }).map((_, idx) => (
            <div key={idx} className="border bg-card rounded-lg overflow-hidden flex flex-col gap-2 p-0 h-full">
              <Skeleton className="aspect-[2/3] w-full rounded-none" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-3.5 w-3/4 rounded" />
                <div className="flex gap-1.5 pt-0.5">
                  <Skeleton className="h-7 flex-1 rounded" />
                  <Skeleton className="h-7 w-10 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 4: Verify Build & Lint**
  Run: `npm run lint`

- [ ] **Step 5: Commit**
  ```bash
  git add app/(dashboard)/media-watchlist/page.tsx app/(dashboard)/media-watchlist/loading.tsx app/(dashboard)/media-watchlist/_components/media-watchlist-client.tsx
  git commit -m "feat: complete pages, routing, and client container for media watchlist"
  ```

---

### Task 7: Integrate Sidebar Navigation

**Files:**
- Modify: `components/app-sidebar.tsx`

- [ ] **Step 1: Check imports & properties in `components/app-sidebar.tsx`**
  Open `components/app-sidebar.tsx` and ensure `Film` icon is imported from `lucide-react`.

- [ ] **Step 2: Add navigation item**
  Modify `platformItems` array inside `AppSidebar` function to include:
  ```typescript
      {
        title: "Media Watchlist",
        url: "/media-watchlist",
        icon: Film,
        isActive: pathname === "/media-watchlist",
      },
  ```
  Insert it under `Projects / Notes` (which is in the `Workspace` item) and above `Organize`:
  ```typescript
      // Location: after Projects/Notes items
      {
        title: "Media Watchlist",
        url: "/media-watchlist",
        icon: Film,
        isActive: pathname === "/media-watchlist",
      },
  ```

- [ ] **Step 3: Verify build**
  Run: `npm run lint`

- [ ] **Step 4: Commit**
  ```bash
  git add components/app-sidebar.tsx
  git commit -m "navigation: add Media Watchlist to the app sidebar"
  ```

---

## Verification Plan

### Automated Checks
- Run: `npm run lint` to verify that there are no type checks or formatting failures.
- Run: `npm run build` to confirm everything builds successfully and there are no compilation bugs.

### Manual Verification
1.  **Sidebar Link**: Log in to UI Volt and check if the **Media Watchlist** sidebar navigation link is visible, and clicking it redirects to `/media-watchlist`.
2.  **Empty State**: Confirm the beautiful Empty State screen displays correctly on first load.
3.  **Add Media Dialog**:
    *   Click "Add Media" or press `⌘K` / `Ctrl+K`.
    *   Verify the search dialog matches the ShadCN layout.
    *   Type "Attack on Titan" and verify debounced search results appear with type badge and poster image.
    *   Click to add. Ensure the item appears instantly on the watchlist page with an optimistic UI state.
    *   Search and attempt to add the same item again. Ensure it does not duplicate and displays a toast message saying `"Already in your watchlist."`.
4.  **Filters**:
    *   Add several items.
    *   Select status/type filter pills. Verify URL updates (`status=watching`, `type=anime`) and items filter instantly.
5.  **Card Interactions**:
    *   **Status Update**: Click the status badge of a card. Change to "Completed". Verify it updates instantly (optimistic state) and changes to "Completed" (✓ icon).
    *   **Rating Update**: Click the rating button. Select `9`. Confirm it changes to `9/10`. Click again and press "Clear Rating". Confirm it clears back to `-/10`.
    *   **Hover states**: Hover over a card. Ensure the poster scales slightly, the card elevates, and the trash icon appears.
    *   **Deletion**: Click the trash icon. Verify the destructive AlertDialog confirmation opens. Press "Delete" and verify the card is removed immediately with a toast alert.
