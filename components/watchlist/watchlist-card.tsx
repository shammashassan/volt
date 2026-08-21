"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { WatchlistItem, WatchlistStatus } from "@/types/watchlist";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Film, Trash2, Check, Info, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { WATCHLIST_STATUS_LABELS } from "@/lib/constants/watchlist";
import { WatchlistDetailDialog } from "./watchlist-detail-dialog";
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
  const [detailOpen, setDetailOpen] = useState(false);
  const [statusPopoverOpen, setStatusPopoverOpen] = useState(false);
  const [ratingPopoverOpen, setRatingPopoverOpen] = useState(false);
  const [tempRating, setTempRating] = useState<number | null>(item.rating ?? null);
  const [isHovered, setIsHovered] = useState(false);

  // Sync tempRating when item.rating changes externally (optimistic update revert etc.)
  useEffect(() => {
    setTempRating(item.rating ?? null);
  }, [item.rating]);

  // Stable outside-click handler — always registered, checks isHovered inside
  const handleOutsideClick = useCallback((e: MouseEvent) => {
    if (!isHovered) return;
    const target = e.target as HTMLElement;
    if (
      target.closest('[role="dialog"]') ||
      target.closest('[data-radix-portal]') ||
      target.closest('[data-radix-popper-content-wrapper]') ||
      target.closest('[data-vaul-drawer]')
    ) return;
    const cardEl = document.getElementById(`watchlist-card-${item._id}`);
    if (cardEl && !cardEl.contains(target)) {
      setIsHovered(false);
      setStatusPopoverOpen(false);
      setRatingPopoverOpen(false);
    }
  }, [isHovered, item._id]);

  useEffect(() => {
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [handleOutsideClick]);

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
          "group relative overflow-hidden aspect-2/3 w-full border-0 bg-card shadow-md transition-all duration-200 ease-out scale-100 select-none rounded-xl cursor-pointer ring-0",
          isHovered && "scale-[1.03] -translate-y-1 shadow-xl ring-1 ring-white/10"
        )}
      >
        {/* Poster */}
        <div className="absolute inset-0 overflow-hidden rounded-xl">
          {item.metadata?.posterUrl ? (
            <Image
              src={item.metadata.posterUrl}
              alt={item.metadata.title}
              fill
              sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 14vw"
              className={cn(
                "object-cover transition-transform duration-300 ease-out",
                isHovered && "scale-[1.05]"
              )}
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full w-full bg-muted/60 text-muted-foreground/40 p-4">
              <Film className="h-8 w-8 stroke-[1.25] mb-2" />
              <span className="text-[11px] text-center font-medium leading-tight max-w-[80%] line-clamp-3">
                {item.metadata?.title || "No Title"}
              </span>
            </div>
          )}
        </div>

        {/* Resting badges — status icon + rating, hidden on hover */}
        <div
          className={cn(
            "absolute bottom-2 left-2 right-2 flex items-center justify-between transition-opacity duration-150",
            isHovered ? "opacity-0 pointer-events-none" : "opacity-100"
          )}
        >
          <Badge
            variant="secondary"
            className="h-7 w-7 p-0 rounded-full flex items-center justify-center bg-background/85 dark:bg-background/60 backdrop-blur-sm border border-border/30 shadow-sm"
            title={activeStatus.label}
          >
            <span className="text-sm font-bold leading-none">{activeStatus.icon}</span>
          </Badge>
          {item.rating && (
            <Badge
              variant="secondary"
              className="h-7 px-2.5 rounded-full flex items-center justify-center text-xs font-bold bg-background/85 dark:bg-background/60 backdrop-blur-sm border border-border/30 shadow-sm"
            >
              {item.rating}
            </Badge>
          )}
        </div>

        {/* Hover overlay — gradient from bottom */}
        <div
          className={cn(
            "absolute inset-0 rounded-xl flex flex-col justify-end transition-opacity duration-200 z-10",
            isHovered ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
        >
          {/* Top action buttons */}
          <div className="absolute top-0 inset-x-0 flex items-center justify-between p-2">
            <button
              onClick={(e) => { e.stopPropagation(); setDetailOpen(true); }}
              aria-label="View details"
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 active:bg-white/30 transition-colors backdrop-blur-sm bg-black/30 border border-white/10 cursor-pointer"
            >
              <Info className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setDeleteOpen(true); }}
              aria-label="Delete media item"
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-red-500/40 active:bg-red-500/60 transition-colors backdrop-blur-sm bg-black/30 border border-white/10 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Gradient scrim */}
          <div className="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-black/95 via-black/60 to-transparent rounded-b-xl pointer-events-none" />

          {/* Bottom content */}
          <div className="relative z-10 p-3 space-y-2">
            {/* Title */}
            <h4 className="font-bold text-[11px] leading-snug line-clamp-2 text-white drop-shadow-md">
              {item.metadata?.title || "Unknown Media"}
            </h4>

            {/* Status chip */}
            <Popover open={statusPopoverOpen} onOpenChange={setStatusPopoverOpen}>
              <PopoverTrigger asChild>
                <button
                  aria-label="Change status"
                  className="w-full text-[10px] h-7 font-semibold px-2 rounded-lg border border-white/15 bg-white/10 hover:bg-white/20 active:bg-white/25 text-white transition-colors flex items-center justify-center gap-1.5 backdrop-blur-sm cursor-pointer select-none"
                >
                  <span className="text-xs leading-none shrink-0">{activeStatus.icon}</span>
                  <span className="text-[10px] truncate">{activeStatus.label}</span>
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

            {/* Rating chip — clean icon + score or Rate */}
            <Popover
              open={ratingPopoverOpen}
              onOpenChange={(open) => {
                setRatingPopoverOpen(open);
                if (open) setTempRating(item.rating ?? null);
              }}
            >
              <PopoverTrigger asChild>
                <button
                  aria-label="Change rating"
                  className={cn(
                    "w-full text-[10px] h-7 px-2 font-semibold rounded-lg border border-white/15 bg-white/10 hover:bg-white/20 active:bg-white/25 text-white transition-colors flex items-center justify-center gap-1.5 backdrop-blur-sm cursor-pointer",
                    item.rating && "border-primary/60 bg-primary/20 hover:bg-primary/30"
                  )}
                >
                  <Star className={cn("h-3 w-3 shrink-0", item.rating ? "fill-primary text-primary" : "text-white/50")} />
                  <span className={cn("text-[10px] font-semibold tabular-nums", item.rating ? "text-primary font-bold" : "text-white/80")}>
                    {item.rating ? `${item.rating} / 10` : "Rate"}
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
                            <span className={cn("h-1 w-px bg-muted-foreground/45", i % skipInterval !== 0 && "h-0.5 bg-muted-foreground/30")} />
                            <span className={cn(i % skipInterval !== 0 && "opacity-0")}>{i}</span>
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
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from watchlist?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove <strong>{item.metadata?.title}</strong> from your watchlist.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                onDelete(item._id!);
                setDeleteOpen(false);
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Detail Dialog / Drawer */}
      <WatchlistDetailDialog
        item={item}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </>
  );
}