"use client";

import React, { useState, useMemo, useEffect } from "react";
import { WatchlistItem, SearchResult, WatchlistStatus } from "../_types/watchlist.types";
import { WatchlistGrid } from "./watchlist-grid";
import { AddMediaDialog } from "./add-media-dialog";
import { Button } from "@/components/ui/button";
import { Plus, Search, Film, Star, Filter } from "lucide-react";
import { toast } from "sonner";
import { useQueryState } from "nuqs";
import { createWatchlistItemAction } from "../_actions/create-watchlist-item";
import { updateWatchlistItemAction } from "../_actions/update-watchlist-item";
import { deleteWatchlistItemAction } from "../_actions/delete-watchlist-item";
import { Kbd } from "@/components/ui/kbd";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Toggle } from "@/components/ui/toggle";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
import { WATCHLIST_STATUS_LABELS } from "../_constants/watchlist.constants";

interface MediaWatchlistClientProps {
  initialItems: WatchlistItem[];
}

export function MediaWatchlistClient({ initialItems }: MediaWatchlistClientProps) {
  const [items, setItems] = useState<WatchlistItem[]>(initialItems);
  const [searchOpen, setSearchOpen] = useState(false);

  // URL State Filters (Nuqs)
  const [statusFilter, setStatusFilter] = useQueryState("status", { defaultValue: "all" });
  const [typeFilter, setTypeFilter] = useQueryState("type", { defaultValue: "all" });
  const [q, setQ] = useQueryState("q", { defaultValue: "" });
  const [ratedFilter, setRatedFilter] = useQueryState("rated", {
    parse: (v) => v === "true",
    serialize: (v) => (v ? "true" : ""),
  });

  // Local input state to prevent typing lag
  const [searchValue, setSearchValue] = useState(q || "");

  // Debouncing search updates to URL
  useEffect(() => {
    const handler = setTimeout(() => {
      setQ(searchValue || null);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchValue, setQ]);

  // Sync local search input value if URL changes externally
  useEffect(() => {
    setSearchValue(q || "");
  }, [q]);

  // Filter Logic
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const title = (item.metadata?.title || "").toLowerCase();
      const matchesSearch = !q || title.includes(q.toLowerCase());

      const matchesStatus = statusFilter === "all" || !statusFilter || item.status === statusFilter;
      const matchesType = typeFilter === "all" || !typeFilter || item.type === typeFilter;
      const matchesRated = !ratedFilter || (item.rating !== undefined && item.rating !== null);

      return matchesSearch && matchesStatus && matchesType && matchesRated;
    });
  }, [items, q, statusFilter, typeFilter, ratedFilter]);

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
    <div className="flex flex-1 flex-col gap-6 pb-12">
      {/* Header section */}
      <section className="px-4 pt-8 lg:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between max-w-7xl">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Film className="size-6" />
              </div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-black tracking-tight md:text-4xl bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/60">
                  Media Watchlist
                </h1>
                <Badge variant="outline" className="h-6 rounded-full border-primary/20 bg-primary/5 text-primary text-[10px] uppercase font-bold tracking-widest px-2.5">
                  {filteredItems.length} Items
                </Badge>
              </div>
            </div>
            <p className="text-lg text-muted-foreground/80 max-w-2xl font-medium">
              Track movies, series, and anime. Press <Kbd>Ctrl</Kbd>+<Kbd>M</Kbd> to search database.
            </p>
          </div>
          <Button onClick={() => setSearchOpen(true)} className="w-full sm:w-auto shrink-0 gap-2 font-bold">
            <Plus className="size-4" />
            Add Media
          </Button>
        </div>
      </section>

      {/* Filter Toolbar */}
      <section className="px-4 lg:px-6">
        <div className="p-4 border border-border/40 bg-card/30 backdrop-blur-sm rounded-2xl flex flex-col gap-4 lg:flex-row lg:items-center max-w-7xl">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search watchlist..."
              className="pl-9 h-10 border-border/60 bg-background/50 focus-visible:ring-primary/20"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            {/* Status Filter */}
            <Select
              value={statusFilter || "all"}
              onValueChange={(val) => setStatusFilter(val === "all" ? null : val)}
            >
              <SelectTrigger className="w-[140px] h-10 bg-background/50 border-border/60">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {(Object.keys(WATCHLIST_STATUS_LABELS) as WatchlistStatus[]).map((key) => {
                  const option = WATCHLIST_STATUS_LABELS[key];
                  return (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2">
                        <span className="text-[10px]">{option.icon}</span>
                        <span>{option.label}</span>
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select
              value={typeFilter || "all"}
              onValueChange={(val) => setTypeFilter(val === "all" ? null : val)}
            >
              <SelectTrigger className="w-[140px] h-10 bg-background/50 border-border/60">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="movie">Movie</SelectItem>
                <SelectItem value="series">Series</SelectItem>
                <SelectItem value="anime">Anime</SelectItem>
              </SelectContent>
            </Select>

            {/* Rated Toggle */}
            <Toggle
              pressed={ratedFilter || false}
              onPressedChange={(pressed) => setRatedFilter(pressed || null)}
              variant="outline"
              className="h-10"
            >
              <Star className={`size-3.5 mr-2 ${ratedFilter ? "fill-current" : ""}`} />
              <span>Rated</span>
            </Toggle>
          </div>
        </div>
      </section>

      {/* Results / List State */}
      <section className="px-4 lg:px-6">
        <div className="max-w-7xl">
          {filteredItems.length === 0 ? (
            items.length === 0 ? (
              <Empty className="py-24 border border-dashed rounded-3xl bg-card/10">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Film />
                  </EmptyMedia>
                  <EmptyTitle>No media yet</EmptyTitle>
                  <EmptyDescription>
                    Track movies, series, and anime in one place.
                  </EmptyDescription>
                </EmptyHeader>
                <Button onClick={() => setSearchOpen(true)} className="mt-4" size="sm">
                  Add Media
                </Button>
              </Empty>
            ) : (
              <Empty className="py-24 border border-dashed rounded-3xl bg-card/10">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Filter />
                  </EmptyMedia>
                  <EmptyTitle>No media matches the selected filters</EmptyTitle>
                  <EmptyDescription>Try resetting your filters.</EmptyDescription>
                </EmptyHeader>
                <Button
                  variant="link"
                  className="text-xs mt-2 cursor-pointer"
                  onClick={() => {
                    setStatusFilter("all");
                    setTypeFilter("all");
                    setSearchValue("");
                    setRatedFilter(null);
                  }}
                >
                  Clear Filters
                </Button>
              </Empty>
            )
          ) : (
            <WatchlistGrid
              items={filteredItems}
              onUpdateStatus={handleUpdateStatus}
              onUpdateRating={handleUpdateRating}
              onDelete={handleDelete}
            />
          )}
        </div>
      </section>

      {/* Command Search Dialog */}
      <AddMediaDialog open={searchOpen} onOpenChange={setSearchOpen} onSelect={handleAddMedia} />
    </div>
  );
}
