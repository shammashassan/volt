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
      <Card className="group relative overflow-hidden aspect-[2/3] w-full border bg-card shadow-sm transition-all duration-150 ease-in-out scale-100 hover:scale-[1.02] hover:-translate-y-[2.5px] select-none rounded-xl">
        {/* Poster Image or Placeholder */}
        <div className="absolute inset-0 bg-muted/30 overflow-hidden">
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
              <Film className="h-8 w-8 stroke-[1.25] mb-2 animate-pulse" />
              <span className="text-[11px] text-center font-medium leading-tight max-w-[80%] line-clamp-3">
                {item.metadata?.title || "No Title"}
              </span>
            </div>
          )}
        </div>

        {/* Badges Visible when NOT Hovered */}
        <Badge
          variant="secondary"
          className="absolute bottom-2 left-2 text-[10px] py-0 px-1.5 font-bold bg-background/80 dark:bg-background/60 backdrop-blur-xs select-none group-hover:opacity-0 transition-opacity duration-150 border border-border/30"
        >
          {activeStatus.icon} {activeStatus.label}
        </Badge>
        {item.rating && (
          <Badge
            variant="secondary"
            className="absolute bottom-2 right-2 text-[10px] py-0 px-1.5 font-bold bg-background/80 dark:bg-background/60 backdrop-blur-xs select-none group-hover:opacity-0 transition-opacity duration-150 border border-border/30"
          >
            {item.rating}/10
          </Badge>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 flex flex-col justify-between p-3 bg-white/90 dark:bg-black/85 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 border border-transparent group-hover:border-border/30 rounded-xl">
          {/* Top Row of Overlay */}
          <div className="flex items-center justify-between">
            <Badge
              variant="secondary"
              className="text-[9px] py-0.5 px-1.5 font-bold uppercase tracking-wide bg-background/80 dark:bg-background/60 backdrop-blur-xs border border-border/30"
            >
              {item.type === "movie" ? "Movie" : item.type === "series" ? "Series" : "Anime"}
            </Badge>
            <button
              onClick={() => setDeleteOpen(true)}
              aria-label="Delete media item"
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-colors border border-border/20 bg-background/30 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Bottom Section of Overlay (Title + Controls) */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs leading-snug line-clamp-2 text-foreground">
              {item.metadata?.title || "Unknown Media"}
            </h4>

            <div className="flex items-center gap-1.5">
              {/* Status Selector Popover */}
              <Popover open={statusPopoverOpen} onOpenChange={setStatusPopoverOpen}>
                <PopoverTrigger asChild>
                  <button
                    aria-label="Change status"
                    className="flex-1 text-[10px] h-7 font-medium px-2 py-0.5 rounded-md border border-border/30 bg-background/50 hover:bg-accent text-left transition-colors flex items-center justify-between overflow-hidden cursor-pointer select-none"
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
                          "w-full text-left text-xs px-2.5 py-1.5 rounded-sm flex items-center justify-between hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer",
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
                      "text-[10px] h-7 px-1.5 font-medium rounded-md border border-border/30 transition-colors flex items-center justify-center min-w-10 hover:bg-accent cursor-pointer",
                      item.rating ? "bg-accent/40 text-foreground" : "bg-background/50 text-muted-foreground"
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
                            "h-7 w-7 text-xs rounded-md border flex items-center justify-center font-medium transition-colors hover:bg-primary hover:text-primary-foreground cursor-pointer",
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
                      className="w-full text-center text-xs mt-2 py-1 border border-dashed rounded-md hover:bg-destructive hover:text-destructive-foreground transition-colors cursor-pointer"
                    >
                      Clear Rating
                    </button>
                  )}
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
