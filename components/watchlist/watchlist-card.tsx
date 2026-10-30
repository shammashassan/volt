"use client";

import React, { useState } from "react";
import Image from "next/image";
import { WatchlistItem, WatchlistStatus } from "@/types/watchlist";
import { Card } from "@/components/ui/card";
import { Film, Trash2, Star } from "lucide-react";
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
  const activeStatus = WATCHLIST_STATUS_LABELS[item.status];

  return (
    <>
      <Card
        id={`watchlist-card-${item._id}`}
        onClick={() => setDetailOpen(true)}
        className="group relative overflow-hidden aspect-2/3 w-full"
      >
        {/* Poster */}
        <div className="absolute inset-0 overflow-hidden rounded-xl">
          {item.metadata?.posterUrl ? (
            <Image
              src={item.metadata.posterUrl}
              alt={item.metadata.title}
              fill
              sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 14vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
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

        {/* Resting badges — status icon + rating pill */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between transition-opacity duration-200 group-hover:opacity-0 pointer-events-none">
          <div
            className="h-7 w-7 rounded-full flex items-center justify-center bg-background/85 dark:bg-background/60 backdrop-blur-sm border border-border/30 shadow-sm"
            title={activeStatus.label}
          >
            <span className="text-sm font-bold leading-none">{activeStatus.icon}</span>
          </div>
          {item.rating && (
            <div className="h-7 px-2.5 rounded-full flex items-center justify-center text-xs font-bold bg-background/85 dark:bg-background/60 backdrop-blur-sm border border-border/30 shadow-sm text-foreground">
              <Star className="size-3 fill-primary text-primary mr-1" />
              <span>{item.rating}</span>
            </div>
          )}
        </div>

        {/* Hover overlay — gradient from bottom */}
        <div className="absolute inset-0 rounded-xl flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          {/* Top action buttons */}
          <div className="absolute top-0 inset-x-0 flex items-center justify-end p-2 z-20">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDeleteOpen(true);
              }}
              aria-label="Delete media item"
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-destructive/60 active:bg-destructive/80 transition-colors backdrop-blur-sm bg-black/40 border border-white/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Gradient scrim */}
          <div className="absolute inset-x-0 bottom-0 h-[75%] bg-gradient-to-t from-black/95 via-black/60 to-transparent rounded-b-xl pointer-events-none" />

          {/* Bottom content */}
          <div className="relative z-10 p-3 space-y-1.5">
            <h4 className="font-bold text-xs leading-snug line-clamp-2 text-white drop-shadow-md">
              {item.metadata?.title || "Unknown Media"}
            </h4>

            <div className="flex items-center justify-between gap-1.5 pt-0.5 text-[11px] font-medium text-white/90">
              <span className="truncate flex items-center gap-1.5 min-w-0">
                <span className="shrink-0">{activeStatus.icon}</span>
                <span className="truncate">{activeStatus.label}</span>
              </span>
              {item.rating && (
                <span className="flex items-center gap-1 shrink-0 font-bold text-amber-400">
                  <Star className="size-3 fill-current" />
                  <span>{item.rating}</span>
                </span>
              )}
            </div>
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

      {/* Detail Dialog (PC) / Drawer (Mobile) */}
      <WatchlistDetailDialog
        item={item}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onUpdateStatus={onUpdateStatus}
        onUpdateRating={onUpdateRating}
        onDelete={onDelete}
      />
    </>
  );
}
