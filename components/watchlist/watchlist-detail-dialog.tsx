"use client";

import React from "react";
import { WatchlistItem } from "@/types/watchlist";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Film, Calendar, Tv, Clock, Star, Tag } from "lucide-react";
import { WATCHLIST_STATUS_LABELS, WATCHLIST_TYPE_LABELS } from "@/lib/constants/watchlist";
import { cn } from "@/lib/utils";

interface WatchlistDetailDialogProps {
  item: WatchlistItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatDate(dateStr?: string): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

interface DetailRowProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

function DetailRow({ icon, label, value }: DetailRowProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted/70 text-muted-foreground">
        {icon}
      </div>
      <div className="flex flex-col gap-0.5 min-w-0 py-0.5">
        <span className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/60">
          {label}
        </span>
        <span className="text-sm font-medium text-foreground leading-snug break-words">{value}</span>
      </div>
    </div>
  );
}

export function WatchlistDetailDialog({ item, open, onOpenChange }: WatchlistDetailDialogProps) {
  const meta = item.metadata;
  const activeStatus = WATCHLIST_STATUS_LABELS[item.status];
  const typeLabel = WATCHLIST_TYPE_LABELS[item.type];

  const theatricalDate = formatDate(meta?.theatricalReleaseDate || meta?.releaseDate);
  const ottDate = formatDate(meta?.ottReleaseDate);
  const nextEpDate = formatDate(meta?.nextEpisodeDate);

  const isMovie = item.type === "movie";
  const isEpisodic = item.type === "series" || item.type === "anime";
  const hasDates = theatricalDate || ottDate || nextEpDate;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-sm sm:max-w-md p-0 overflow-y-auto max-h-[85dvh] no-scrollbar !gap-0 border-border/60 rounded-2xl shadow-2xl bg-card overscroll-contain [&_[data-slot=dialog-close]]:z-50 [&_[data-slot=dialog-close]]:text-white/80 [&_[data-slot=dialog-close]]:hover:text-white [&_[data-slot=dialog-close]]:bg-black/40 [&_[data-slot=dialog-close]]:backdrop-blur-sm [&_[data-slot=dialog-close]]:rounded-full [&_[data-slot=dialog-close]]:top-3 [&_[data-slot=dialog-close]]:right-3">
        <DialogTitle className="sr-only">{meta?.title || "Media Details"}</DialogTitle>

        {/* Bleed header */}
        <div className="relative overflow-hidden shrink-0">
          {meta?.posterUrl && (
            <div
              className="absolute inset-0 scale-110"
              style={{
                backgroundImage: `url(${meta.posterUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center top",
                filter: "blur(32px) brightness(0.3) saturate(1.6)",
                willChange: "transform",
                transform: "translateZ(0)",
              }}
            />
          )}
          {!meta?.posterUrl && <div className="absolute inset-0 bg-muted/40" />}
          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-card to-transparent" />

          <div className="relative z-10 flex items-end gap-3.5 px-4 sm:px-5 pt-6 pb-4 sm:pb-5">
            {/* Poster thumbnail */}
            <div className="relative shrink-0 h-24 w-16 sm:h-28 sm:w-20 rounded-xl overflow-hidden border border-white/20 shadow-xl shadow-black/60 ring-1 ring-black/20 bg-muted">
              {meta?.posterUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={meta.posterUrl} alt={meta.title} className="object-cover w-full h-full" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
                  <Film className="h-5 w-5 stroke-[1.25]" />
                </div>
              )}
            </div>

            {/* Title + meta */}
            <div className="flex flex-col gap-1.5 min-w-0 pb-0.5 flex-1">
              <div className="text-sm sm:text-base font-bold leading-snug text-white drop-shadow-sm line-clamp-2 pr-8">
                {meta?.title || "Unknown Media"}
              </div>
              <div className="flex flex-wrap gap-1.5 items-center">
                {meta?.releaseYear && (
                  <span className="text-[11px] text-white/70 font-semibold tabular-nums">{meta.releaseYear}</span>
                )}
                <Badge className="text-[9px] uppercase tracking-wide font-bold py-0 px-2 h-5 bg-white/15 hover:bg-white/15 border-white/20 text-white">
                  {typeLabel}
                </Badge>
                <Badge variant="outline" className="text-[9px] uppercase tracking-wide font-bold py-0 px-2 h-5 border-white/20 text-white/70 bg-transparent">
                  {item.source === "tmdb" ? "TMDb" : "AniList"}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Body content */}
        <div className="px-4 sm:px-5 pt-2 pb-5 space-y-3.5">
          {/* Status + Rating cards */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex flex-col gap-1 rounded-xl bg-muted/50 border border-border/40 px-3.5 py-2.5">
              <span className="text-[9px] uppercase tracking-widest font-semibold text-muted-foreground/60">Status</span>
              <span className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1.5 mt-0.5 truncate">
                <span className="text-sm leading-none shrink-0">{activeStatus.icon}</span>
                <span className="truncate">{activeStatus.label}</span>
              </span>
            </div>
            <div className="flex flex-col gap-1 rounded-xl bg-muted/50 border border-border/40 px-3.5 py-2.5">
              <span className="text-[9px] uppercase tracking-widest font-semibold text-muted-foreground/60">Rating</span>
              <span className="mt-0.5">
                {item.rating ? (
                  <span className="flex items-baseline gap-1">
                    <Star className="h-3.5 w-3.5 fill-primary text-primary mb-0.5 self-center shrink-0" />
                    <span className="text-xs sm:text-sm font-bold text-primary tabular-nums">{item.rating}</span>
                    <span className="text-xs text-muted-foreground/50 font-medium">/10</span>
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground/40 italic">Unrated</span>
                )}
              </span>
            </div>
          </div>

          {/* Runtime */}
          {isMovie && meta?.runtime && (
            <div className="flex items-center gap-3 rounded-xl bg-muted/50 border border-border/40 px-3.5 py-2.5">
              <Clock className="h-4 w-4 text-muted-foreground/60 shrink-0" />
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[9px] uppercase tracking-widest font-semibold text-muted-foreground/60">Runtime</span>
                <span className="text-xs sm:text-sm font-medium">{meta.runtime} min</span>
              </div>
            </div>
          )}

          {/* Genres */}
          {meta?.genres && meta.genres.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[9px] uppercase tracking-widest font-semibold text-muted-foreground/50 flex items-center gap-1.5">
                <Tag className="h-2.5 w-2.5" /> Genres
              </span>
              <div className="flex flex-wrap gap-1.5">
                {meta.genres.map((genre) => (
                  <Badge key={genre} variant="secondary" className="text-[10px] font-medium py-0.5 px-2.5 h-auto rounded-full">
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Dates */}
          {hasDates && (
            <>
              <Separator className="opacity-40" />
              <div className="space-y-3">
                <span className="text-[9px] uppercase tracking-widest font-semibold text-muted-foreground/50 flex items-center gap-1.5">
                  <Calendar className="h-2.5 w-2.5" /> Dates
                </span>
                {theatricalDate && (
                  <DetailRow
                    icon={<Calendar className="h-3.5 w-3.5" />}
                    label={isMovie ? "Theatrical" : "Premiere"}
                    value={theatricalDate}
                  />
                )}
                {isMovie && ottDate && (
                  <DetailRow
                    icon={<Tv className="h-3.5 w-3.5" />}
                    label="Streaming"
                    value={ottDate}
                  />
                )}
                {isEpisodic && nextEpDate && (
                  <DetailRow
                    icon={<Calendar className="h-3.5 w-3.5" />}
                    label={meta?.nextEpisodeNumber ? `Next Episode (Ep. ${meta.nextEpisodeNumber})` : "Next Episode"}
                    value={nextEpDate}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}