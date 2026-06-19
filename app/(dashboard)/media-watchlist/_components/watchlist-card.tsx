"use client";

import React, { useState, useEffect } from "react";
import { WatchlistItem, WatchlistStatus } from "../_types/watchlist.types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
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
  const [tempRating, setTempRating] = useState<number | null>(item.rating || null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setTempRating(item.rating || null);
  }, [item.rating]);

  useEffect(() => {
    if (!isHovered) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // If user is clicking within a portal dialog, popper or radix wrapper, do not close hover overlay
      if (
        target.closest('[role="dialog"]') ||
        target.closest('[data-radix-portal]') ||
        target.closest('[data-radix-popper-content-wrapper]')
      ) {
        return;
      }
      const cardEl = document.getElementById(`watchlist-card-${item._id}`);
      if (cardEl && !cardEl.contains(target)) {
        setIsHovered(false);
        setStatusPopoverOpen(false);
        setRatingPopoverOpen(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [isHovered, item._id]);

  const activeStatus = WATCHLIST_STATUS_LABELS[item.status];

  return (
    <>
      <Card
        id={`watchlist-card-${item._id}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setStatusPopoverOpen(false);
          setRatingPopoverOpen(false);
        }}
        onClick={(e) => {
          if (!isHovered) {
            setIsHovered(true);
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        className={cn(
          "group relative overflow-hidden aspect-[2/3] w-full border bg-card shadow-sm transition-all duration-150 ease-in-out scale-100 select-none rounded-xl cursor-pointer",
          isHovered && "scale-[1.02] -translate-y-[2.5px]"
        )}
      >
        {/* Poster Image or Placeholder */}
        <div className="absolute inset-0 bg-muted/30 overflow-hidden">
          {item.metadata?.posterUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.metadata.posterUrl}
              alt={item.metadata.title}
              className={cn(
                "object-cover w-full h-full transition-transform duration-250 ease-in-out",
                isHovered && "scale-[1.03]"
              )}
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full w-full bg-muted/40 text-muted-foreground/50 p-4">
              <Film className="h-8 w-8 stroke-[1.25] mb-2 animate-pulse" />
              <span className="text-[11px] text-center font-medium leading-tight max-w-[80%] line-clamp-3">
                {item.metadata?.title || "No Title"}
              </span>
            </div>
          )}
        </div>

        {/* Badges Visible when NOT Hovered (Circular to prevent collision) */}
        <Badge
          variant="secondary"
          className={cn(
            "absolute bottom-2 left-2 h-7 w-7 p-0 rounded-full flex items-center justify-center bg-background/85 dark:bg-background/60 backdrop-blur-xs select-none transition-opacity duration-150 border border-border/30",
            isHovered && "opacity-0 pointer-events-none"
          )}
          title={activeStatus.label}
        >
          <span className="text-sm font-bold">{activeStatus.icon}</span>
        </Badge>
        {item.rating && (
          <Badge
            variant="secondary"
            className={cn(
              "absolute bottom-2 right-2 h-7 px-2.5 rounded-full flex items-center justify-center text-xs font-bold bg-background/85 dark:bg-background/60 backdrop-blur-xs select-none transition-opacity duration-150 border border-border/30",
              isHovered && "opacity-0 pointer-events-none"
            )}
          >
            {item.rating}
          </Badge>
        )}

        {/* Hover Overlay (Subtly Darkened for clean visual feedback, keeping image clearly visible) */}
        <div
          className={cn(
            "absolute inset-0 flex flex-col justify-between p-3 bg-black/15 dark:bg-black/25 transition-opacity duration-200 z-10 border border-transparent rounded-xl",
            isHovered ? "opacity-100 pointer-events-auto border-white/10" : "opacity-0 pointer-events-none"
          )}
        >
          {/* Top Row of Overlay */}
          <div className="flex items-center justify-between">
            <Badge
              variant="secondary"
              className="text-[9px] py-0.5 px-1.5 font-bold uppercase tracking-wide bg-black/60 border border-white/10 text-white"
            >
              {item.type === "movie" ? "Movie" : item.type === "series" ? "Series" : "Anime"}
            </Badge>
            <button
              onClick={() => setDeleteOpen(true)}
              aria-label="Delete media item"
              className="p-1 rounded-md text-white/70 hover:text-white hover:bg-white/15 transition-colors border border-white/10 bg-black/35 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Bottom Section of Overlay (Title + Controls) */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs leading-snug line-clamp-2 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              {item.metadata?.title || "Unknown Media"}
            </h4>

            <div className="space-y-1.5">
              {/* Status Selector Popover */}
              <Popover open={statusPopoverOpen} onOpenChange={setStatusPopoverOpen}>
                <PopoverTrigger asChild>
                  <button
                    aria-label="Change status"
                    className="w-full text-[10px] h-7 font-medium px-2 py-0.5 rounded-md border border-white/10 bg-black/50 hover:bg-black/70 text-white text-left transition-colors flex items-center justify-between overflow-hidden cursor-pointer select-none"
                  >
                    <span className="truncate">{activeStatus.label}</span>
                    <span className="text-[13px] text-white/60 ml-1">{activeStatus.icon}</span>
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
                          "w-full text-left text-xs px-2.5 py-1.5 rounded-sm flex items-center justify-between hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer",
                          isSelected && "font-semibold text-primary bg-accent/30"
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-[13px]">{option.icon}</span>
                          {option.label}
                        </span>
                        {isSelected && <Check className="h-3 w-3" />}
                      </button>
                    );
                  })}
                </PopoverContent>
              </Popover>

              {/* Rating Selector Popover */}
              <Popover
                open={ratingPopoverOpen}
                onOpenChange={(open) => {
                  setRatingPopoverOpen(open);
                  if (open) {
                    setTempRating(item.rating || null);
                  }
                }}
              >
                <PopoverTrigger asChild>
                  <button
                    aria-label="Change rating"
                    className={cn(
                      "w-full text-[10px] h-7 px-2 font-medium rounded-md border border-white/10 transition-colors flex items-center justify-between bg-black/50 hover:bg-black/70 text-white cursor-pointer",
                      item.rating && "border-primary/50"
                    )}
                  >
                    <span>Rating</span>
                    <span className={cn("text-white/60 font-semibold", item.rating && "text-primary font-bold")}>
                      {item.rating ? `${item.rating}/10` : "-/10"}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-3" align="end">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-muted-foreground">Rating</span>
                      <span className="text-xs font-bold text-primary">
                        {tempRating !== null ? `${tempRating}/10` : "Unrated"}
                      </span>
                    </div>
                    <div className="px-1">
                      <Slider
                        aria-label="Rating slider"
                        value={[tempRating || 5]}
                        min={1}
                        max={10}
                        step={1}
                        onValueChange={(val) => setTempRating(val[0])}
                        onValueCommit={(val) => onUpdateRating(item._id!, val[0])}
                      />
                      <span
                        aria-hidden="true"
                        className="mt-2.5 flex w-full items-center justify-between gap-1 px-0.5 font-medium text-muted-foreground/60 text-[9px] select-none"
                      >
                        {[...Array(10)].map((_, idx) => {
                          const i = idx + 1;
                          const skipInterval = 2;
                          return (
                            <span className="flex w-0 flex-col items-center justify-center gap-1" key={String(i)}>
                              <span
                                className={cn(
                                  "h-1 w-px bg-muted-foreground/45",
                                  i % skipInterval !== 0 && "h-0.5 bg-muted-foreground/30",
                                )}
                              />
                              <span className={cn(i % skipInterval !== 0 && "opacity-0")}>
                                {i}
                              </span>
                            </span>
                          );
                        })}
                      </span>
                    </div>
                    {item.rating && (
                      <button
                        onClick={() => {
                          onUpdateRating(item._id!, null);
                          setTempRating(null);
                          setRatingPopoverOpen(false);
                        }}
                        className="w-full text-center text-xs py-1 border border-dashed rounded-md hover:bg-destructive hover:text-destructive-foreground transition-colors cursor-pointer"
                      >
                        Clear Rating
                      </button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
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
