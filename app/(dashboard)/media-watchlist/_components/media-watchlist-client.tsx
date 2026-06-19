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
import { Kbd } from "@/components/ui/kbd";

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
            <Kbd>Ctrl</Kbd>+
            <Kbd>M</Kbd>{" "}
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
              className="text-xs mt-2 cursor-pointer"
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
