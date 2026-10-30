"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { WatchlistItem, SearchResult, WatchlistStatus } from "@/types/watchlist";
import { WatchlistGrid } from "./watchlist-grid";
import { AddMediaDialog } from "./add-media-dialog";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Search,
  Film,
  Star,
  Filter,
  Sparkles,
  Play,
  Clock,
  CheckCircle2,
  XCircle,
  Layers,
} from "lucide-react";
import { toast } from "@/components/ui/toast";
import { useQueryState } from "nuqs";
import { createWatchlistItemAction, updateWatchlistItemAction, deleteWatchlistItemAction } from "@/lib/actions/watchlist";
import { Kbd } from "@/components/ui/kbd";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Badge } from "@/components/ui/badge";
import { Toggle } from "@/components/ui/toggle";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface MediaWatchlistClientProps {
  initialItems: WatchlistItem[];
}

export function MediaWatchlistClient({ initialItems }: MediaWatchlistClientProps) {
  const [items, setItems] = useState<WatchlistItem[]>(initialItems);
  const [searchOpen, setSearchOpen] = useState(false);

  // URL State Filters (Nuqs) - Defaults to 'active' (Planned + Watching)
  const [statusFilter, setStatusFilter] = useQueryState("status", { defaultValue: "active" });
  const [typeFilter, setTypeFilter] = useQueryState("type", { defaultValue: "all" });
  const [q, setQ] = useQueryState("q", { defaultValue: "" });
  const [ratedFilter, setRatedFilter] = useQueryState("rated", {
    parse: (v) => v === "true",
    serialize: (v) => (v ? "true" : ""),
  });

  const currentQ = q ?? "";
  const [searchValue, setSearchValue] = useState(currentQ);

  // Debouncing search updates to URL
  useEffect(() => {
    const handler = setTimeout(() => {
      setQ(searchValue || null);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchValue, setQ]);

  // Sync local search input value if URL changes externally
  const [prevQ, setPrevQ] = useState(currentQ);
  if (currentQ !== prevQ) {
    setPrevQ(currentQ);
    setSearchValue(currentQ);
  }

  const activeStatus = statusFilter || "active";
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll selected tab into view when active tab changes on smaller screens
  useEffect(() => {
    if (!tabsContainerRef.current) return;
    const activeTab = tabsContainerRef.current.querySelector<HTMLElement>('[data-active], [data-state="active"]');
    if (activeTab) {
      activeTab.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }
  }, [activeStatus]);

  // Tab count badges (reflecting current search, type, and rating filters)
  const tabCounts = useMemo(() => {
    const matching = items.filter((item) => {
      const title = (item.metadata?.title || "").toLowerCase();
      const matchesSearch = !q || title.includes(q.toLowerCase());
      const matchesType = typeFilter === "all" || !typeFilter || item.type === typeFilter;
      const matchesRated = !ratedFilter || (item.rating !== undefined && item.rating !== null);
      return matchesSearch && matchesType && matchesRated;
    });

    let watching = 0;
    let planned = 0;
    let completed = 0;
    let dropped = 0;

    for (const item of matching) {
      if (item.status === "watching") watching++;
      else if (item.status === "planned") planned++;
      else if (item.status === "completed") completed++;
      else if (item.status === "dropped") dropped++;
    }

    return {
      active: watching + planned,
      watching,
      planned,
      completed,
      dropped,
      all: matching.length,
    };
  }, [items, q, typeFilter, ratedFilter]);

  // Filter Logic
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const title = (item.metadata?.title || "").toLowerCase();
      const matchesSearch = !q || title.includes(q.toLowerCase());

      let matchesStatus = true;
      if (activeStatus === "active") {
        matchesStatus = item.status === "planned" || item.status === "watching";
      } else if (activeStatus !== "all") {
        matchesStatus = item.status === activeStatus;
      }

      const matchesType = typeFilter === "all" || !typeFilter || item.type === typeFilter;
      const matchesRated = !ratedFilter || (item.rating !== undefined && item.rating !== null);

      return matchesSearch && matchesStatus && matchesType && matchesRated;
    });
  }, [items, q, activeStatus, typeFilter, ratedFilter]);

  // 1. Add Media Handlers
  const handleAddMedia = async (result: SearchResult) => {
    setSearchOpen(false);

    // Duplicate Local Check
    const isDuplicate = items.some(
      (i) => i.source === result.source && i.externalId === result.externalId
    );
    if (isDuplicate) {
      toast.add({
        title: "Already in your watchlist.",
        type: "info",
      });
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

    const promise = createWatchlistItemAction({
      externalId: result.externalId,
      source: result.source,
      type: result.type,
      status: "planned",
      metadata: optimisticItem.metadata,
    }).then((res) => {
      if (!res.success) {
        setItems((prev) => prev.filter((i) => i._id !== tempId));
        throw new Error(res.error || "Failed to add item.");
      }
      if (res.exists) {
        // Remove temp and place existing in local list if not there
        setItems((prev) => {
          const filtered = prev.filter((i) => i._id !== tempId);
          if (filtered.some((i) => i._id === res.data?._id)) return filtered;
          return [res.data!, ...filtered];
        });
        return "Already in your watchlist.";
      }
      // Swap temp with actual DB inserted item
      setItems((prev) => prev.map((i) => (i._id === tempId ? res.data! : i)));
      return `Added "${result.title}" to watchlist`;
    });

    toast.promise(promise, {
      loading: `Adding "${result.title}" to watchlist...`,
      success: (msg: string) => msg,
      error: (err: any) => err?.message || "Failed to add item.",
    });
  };

  // 2. Update Status Handlers
  const handleUpdateStatus = async (id: string, status: WatchlistStatus) => {
    // Optimistic Update
    const oldItems = [...items];
    setItems((prev) =>
      prev.map((i) => (i._id === id ? { ...i, status, updatedAt: new Date() } : i))
    );

    const promise = updateWatchlistItemAction(id, { status }).then((res) => {
      if (!res.success) {
        setItems(oldItems);
        throw new Error(res.error || "Failed to update status.");
      }
      return res;
    });

    toast.promise(promise, {
      loading: "Updating status...",
      success: "Updated status",
      error: (err: any) => err?.message || "Failed to update status.",
    });
  };

  // 3. Update Rating Handlers
  const handleUpdateRating = async (id: string, rating: number | null) => {
    const oldItems = [...items];
    setItems((prev) =>
      prev.map((i) => (i._id === id ? { ...i, rating: rating ?? undefined, updatedAt: new Date() } : i))
    );

    const promise = updateWatchlistItemAction(id, { rating }).then((res) => {
      if (!res.success) {
        setItems(oldItems);
        throw new Error(res.error || "Failed to update rating.");
      }
      return res;
    });

    toast.promise(promise, {
      loading: "Updating rating...",
      success: rating ? `Rated ${rating}/10` : "Cleared rating",
      error: (err: any) => err?.message || "Failed to update rating.",
    });
  };

  // 4. Delete Handlers
  const handleDelete = async (id: string) => {
    const oldItems = [...items];
    const targetItem = items.find((i) => i._id === id);
    setItems((prev) => prev.filter((i) => i._id !== id));

    const promise = deleteWatchlistItemAction(id).then((res) => {
      if (!res.success) {
        setItems(oldItems);
        throw new Error(res.error || "Failed to delete item.");
      }
      return res;
    });

    toast.promise(promise, {
      loading: "Deleting item...",
      success: `Deleted "${targetItem?.metadata?.title || "item"}"`,
      error: (err: any) => err?.message || "Failed to delete item.",
    });
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
                <Badge variant="outline">
                  <span className="text-[10px] uppercase font-bold tracking-widest">{filteredItems.length} Items</span>
                </Badge>
              </div>
            </div>
            <p className="text-lg text-muted-foreground/80 max-w-2xl font-medium">
              Track movies, series, and anime. Press <Kbd>Ctrl</Kbd>+<Kbd>M</Kbd> to search database.
            </p>
          </div>
          <Button onClick={() => setSearchOpen(true)}>
            <Plus />
            Add Media
          </Button>
        </div>
      </section>

      {/* Controls Section: Status Tabs & Filter Toolbar */}
      <section className="px-4 lg:px-6">
        <div className="flex flex-col gap-4 max-w-7xl">
          {/* Status Tabs Navigation */}
          <Tabs
            value={activeStatus}
            onValueChange={(val) => setStatusFilter(val === "active" ? null : (val as string))}
            className="w-full"
          >
            <TabsList
              ref={tabsContainerRef}
              className="w-full sm:w-fit max-w-full flex flex-nowrap items-center justify-start overflow-x-auto no-scrollbar scroll-smooth"
            >
                <TabsTrigger
                  value="active"
                  className="h-8 scroll-m-2"
                >
                  <Sparkles className="size-3.5 text-primary shrink-0" />
                  <span>Active</span>
                  <Badge variant="secondary" className="min-w-4">
                    {tabCounts.active}
                  </Badge>
                </TabsTrigger>

                <TabsTrigger
                  value="watching"
                  className="h-8 scroll-m-2"
                >
                  <Play className="size-3.5 text-blue-500 fill-blue-500/20 shrink-0" />
                  <span>Watching</span>
                  <Badge variant="secondary" className="min-w-4">
                    {tabCounts.watching}
                  </Badge>
                </TabsTrigger>

                <TabsTrigger
                  value="planned"
                  className="h-8 scroll-m-2"
                >
                  <Clock className="size-3.5 text-amber-500 shrink-0" />
                  <span>Planned</span>
                  <Badge variant="secondary" className="min-w-4">
                    {tabCounts.planned}
                  </Badge>
                </TabsTrigger>

                <TabsTrigger
                  value="completed"
                  className="h-8 scroll-m-2"
                >
                  <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                  <span>Completed</span>
                  <Badge variant="secondary" className="min-w-4">
                    {tabCounts.completed}
                  </Badge>
                </TabsTrigger>

                <TabsTrigger
                  value="dropped"
                  className="h-8 scroll-m-2"
                >
                  <XCircle className="size-3.5 text-muted-foreground shrink-0" />
                  <span>Dropped</span>
                  <Badge variant="secondary" className="min-w-4">
                    {tabCounts.dropped}
                  </Badge>
                </TabsTrigger>

                <TabsTrigger
                  value="all"
                  className="h-8 scroll-m-2"
                >
                  <Layers className="size-3.5 text-muted-foreground shrink-0" />
                  <span>All</span>
                  <Badge variant="secondary" className="min-w-4">
                    {tabCounts.all}
                  </Badge>
                </TabsTrigger>
              </TabsList>
          </Tabs>

          {/* Search & Sub-filters Toolbar */}
          <div className="p-3 sm:p-4 border border-border/40 bg-card/30 backdrop-blur-sm rounded-2xl flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search */}
            <InputGroup className="flex-1">
              <InputGroupAddon align="inline-start">
                <Search className="size-4 text-muted-foreground pointer-events-none" />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Search watchlist..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="h-9"
              />
            </InputGroup>

            <div className="flex flex-wrap gap-2.5 items-center w-full sm:w-auto">
              {/* Type Filter */}
              <Select
                value={typeFilter || "all"}
                onValueChange={(val) => setTypeFilter(val === "all" ? null : val)}
              >
                <SelectTrigger className="w-[130px] h-9">
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
                size="sm"
                className="h-9"
              >
                <Star className={`size-3.5 mr-1.5 ${ratedFilter ? "fill-current" : ""}`} />
                <span>Rated</span>
              </Toggle>
            </div>
          </div>
        </div>
      </section>

      {/* Results / List State */}
      <section className="px-4 lg:px-6">
        <div className="max-w-7xl">
          {filteredItems.length === 0 ? (
            items.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Film />
                  </EmptyMedia>
                  <EmptyTitle>No media yet</EmptyTitle>
                  <EmptyDescription>
                    Track movies, series, and anime in one place. Press <Kbd>Ctrl</Kbd>+<Kbd>M</Kbd> or click Add Media to begin.
                  </EmptyDescription>
                </EmptyHeader>
                <Button onClick={() => setSearchOpen(true)} className="mt-4" size="sm">
                  <Plus className="size-4 mr-1.5" />
                  Add Media
                </Button>
              </Empty>
            ) : (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Filter />
                  </EmptyMedia>
                  <EmptyTitle>
                    {activeStatus === "active"
                      ? "No active media in queue"
                      : activeStatus === "watching"
                      ? "No media currently watching"
                      : activeStatus === "planned"
                      ? "No media planned"
                      : activeStatus === "completed"
                      ? "No completed media"
                      : activeStatus === "dropped"
                      ? "No dropped media"
                      : "No media matches the selected filters"}
                  </EmptyTitle>
                  <EmptyDescription>
                    {activeStatus === "active" && items.length > 0 && !q && (!typeFilter || typeFilter === "all") && !ratedFilter
                      ? "All caught up! You don't have anything currently in Watching or Planned."
                      : "Try adjusting your filters or search keywords."}
                  </EmptyDescription>
                </EmptyHeader>
                <div className="flex flex-wrap gap-2 justify-center mt-3">
                  {activeStatus === "active" && tabCounts.completed > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setStatusFilter("completed")}
                    >
                      <CheckCircle2 className="size-3.5 mr-1.5 text-emerald-500" />
                      View Completed ({tabCounts.completed})
                    </Button>
                  )}
                  {activeStatus !== "all" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setStatusFilter("all");
                        setTypeFilter("all");
                        setSearchValue("");
                        setRatedFilter(null);
                      }}
                    >
                      View All Media ({items.length})
                    </Button>
                  )}
                  {(q || (typeFilter && typeFilter !== "all") || ratedFilter) && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => {
                        setTypeFilter("all");
                        setSearchValue("");
                        setRatedFilter(null);
                      }}
                    >
                      Clear Search & Sub-filters
                    </Button>
                  )}
                </div>
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
