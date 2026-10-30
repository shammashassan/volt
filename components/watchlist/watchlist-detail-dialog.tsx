"use client";

import React from "react";
import { WatchlistItem, WatchlistStatus } from "@/types/watchlist";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/shared/responsive-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Film, Calendar, Tv, Clock, Star, Tag } from "lucide-react";
import { WATCHLIST_STATUS_LABELS, WATCHLIST_TYPE_LABELS } from "@/lib/constants/watchlist";
import { cn } from "@/lib/utils";

interface WatchlistDetailDialogProps {
  item: WatchlistItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateStatus?: (id: string, status: WatchlistStatus) => void;
  onUpdateRating?: (id: string, rating: number | null) => void;
  onDelete?: (id: string) => void;
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

export function WatchlistDetailDialog({
  item,
  open,
  onOpenChange,
  onUpdateStatus,
  onUpdateRating,
  onDelete,
}: WatchlistDetailDialogProps) {
  const [localRating, setLocalRating] = React.useState<number | null>(item.rating ?? null);

  React.useEffect(() => {
    setLocalRating(item.rating ?? null);
  }, [item.rating]);

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
      <DialogContent bleed className="sm:max-w-md overflow-y-auto max-h-[85dvh] no-scrollbar overscroll-contain">
        <DialogTitle className="sr-only">{meta?.title || "Media Details"}</DialogTitle>
        <DialogDescription className="sr-only">Detailed overview, release dates, and streaming information for {meta?.title || "this media"}.</DialogDescription>

        {/* Bleed header */}
        <div className="relative w-full overflow-hidden shrink-0">
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
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-popover to-transparent" />

          <div className="relative z-10 flex items-end gap-3.5 px-4 sm:px-5 pt-8 pb-4 sm:pb-5">
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
                <Badge variant="outline">
                  <span className="text-[9px] uppercase tracking-wide font-bold">{typeLabel}</span>
                </Badge>
                <Badge variant="outline">
                  <span className="text-[9px] uppercase tracking-wide font-bold">{item.source === "tmdb" ? "TMDb" : "AniList"}</span>
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Body content */}
        <div className="px-4 sm:px-5 pt-3 pb-6 space-y-4">
          {/* Status selector */}
          {onUpdateStatus ? (
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/60">
                Watch Status
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {(Object.keys(WATCHLIST_STATUS_LABELS) as WatchlistStatus[]).map((statusKey) => {
                  const option = WATCHLIST_STATUS_LABELS[statusKey];
                  const isSelected = item.status === statusKey;
                  return (
                    <Button
                      key={statusKey}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => onUpdateStatus(item._id!, statusKey)}
                      className="w-full"
                    >
                      <span className="mr-1">{option.icon}</span>
                      <span>{option.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1 rounded-xl bg-muted/50 border border-border/40 px-3.5 py-2.5">
              <span className="text-[9px] uppercase tracking-widest font-semibold text-muted-foreground/60">Status</span>
              <span className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1.5 mt-0.5 truncate">
                <span className="text-sm leading-none shrink-0">{activeStatus.icon}</span>
                <span className="truncate">{activeStatus.label}</span>
              </span>
            </div>
          )}

          {/* Rating selector */}
          {onUpdateRating ? (
            <div className="space-y-2 rounded-xl bg-muted/40 border border-border/40 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Star className="size-3.5 fill-primary text-primary" />
                  <span className="text-xs font-semibold text-foreground">Score</span>
                </div>
                <div className="flex items-center gap-2">
                  {localRating !== null ? (
                    <>
                      <span className="text-xs font-bold text-primary tabular-nums">{localRating} / 10</span>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => {
                          setLocalRating(null);
                          onUpdateRating(item._id!, null);
                        }}
                      >
                        Clear
                      </Button>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground/50 italic">Unrated</span>
                  )}
                </div>
              </div>
              <div className="px-1 pt-1 pb-1">
                <Slider
                  aria-label="Rating slider"
                  value={[localRating || 5]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={(val) => {
                    const num = Array.isArray(val) ? val[0] : val;
                    setLocalRating(num);
                  }}
                  onValueCommitted={(val) => {
                    const num = Array.isArray(val) ? val[0] : val;
                    onUpdateRating(item._id!, num);
                  }}
                />
              </div>
            </div>
          ) : (
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
          )}

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
                  <Badge key={genre} variant="secondary">
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Dates */}
          {hasDates && (
            <>
              <Separator />
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