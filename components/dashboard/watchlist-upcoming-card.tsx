"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Film, Calendar, Telescope } from 'lucide-react';
import Link from 'next/link';
import { getWatchlistAction } from '@/app/(dashboard)/media-watchlist/_actions/get-watchlist';
import { WatchlistItem } from '@/app/(dashboard)/media-watchlist/_types/watchlist.types';

export function WatchlistUpcomingCard() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await getWatchlistAction();
      if (res.success && res.data) {
        const now = new Date();
        const upcoming = res.data.filter(
          item => {
            const isMovie = item.type === 'movie';
            const isEpisodic = item.type === 'series' || item.type === 'anime';

            if (isMovie) {
              const releaseDate = item.metadata?.releaseDate;
              return (
                item.status === 'planned' &&
                releaseDate &&
                new Date(new Date(releaseDate).setUTCHours(23, 59, 59, 999)) > now
              );
            }
            if (isEpisodic) {
              const nextEpisodeDate = item.metadata?.nextEpisodeDate;
              return (
                item.status === 'watching' &&
                nextEpisodeDate &&
                new Date(new Date(nextEpisodeDate).setUTCHours(23, 59, 59, 999)) > now
              );
            }
            return false;
          }
        ).sort((a, b) => {
          const dateA = a.type === 'movie' ? a.metadata?.releaseDate : a.metadata?.nextEpisodeDate;
          const dateB = b.type === 'movie' ? b.metadata?.releaseDate : b.metadata?.nextEpisodeDate;
          if (!dateA) return 1;
          if (!dateB) return -1;
          return new Date(dateA).getTime() - new Date(dateB).getTime();
        });
        setItems(upcoming);
      }
      setLoaded(true);
    }
    load();
  }, []);

  return (
    <Card className="h-full flex flex-col border-border/50 bg-card/60 shadow-sm backdrop-blur-sm gap-2.5">
      <CardHeader className="flex flex-row items-center gap-0 p-4 pb-2.5 shrink-0">
        <div className="flex items-center gap-2 flex-1">
          <div className="flex size-5 items-center justify-center rounded bg-amber-500/10">
            <Film className="size-3 text-amber-500" />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            upcoming releases
          </span>
        </div>
        {items.length > 0 && (
          <Link
            href="/media-watchlist"
            className="text-[10px] text-primary/70 hover:text-primary hover:underline shrink-0"
          >
            View all →
          </Link>
        )}
      </CardHeader>

      {/* min-h-0 lets ScrollArea grow correctly inside a flex-col parent */}
      <CardContent className="flex flex-1 flex-col min-h-0 px-4 pb-0 pt-0">
        {!loaded ? (
          <div className="flex flex-col gap-1.5">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between rounded-md border border-border/30 bg-muted/10 px-2.5 py-2">
                <div className="h-2.5 w-28 animate-pulse rounded bg-muted/40" />
                <div className="h-2 w-12 animate-pulse rounded bg-muted/30" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-1 items-center justify-center gap-3.5 rounded-lg border border-dashed border-border/40 bg-muted/10 p-4">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-500/10">
              <Telescope className="size-4 shrink-0 text-amber-500/70" />
            </div>
            <div className="flex flex-col min-w-0">
              <p className="text-xs font-medium text-foreground">Nothing on the horizon</p>
              <p className="text-[10px] text-muted-foreground/60 leading-normal">No planned releases coming up.</p>
              <Link href="/media-watchlist" className="text-[10px] text-primary hover:underline mt-1">
                Add to watchlist →
              </Link>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="flex flex-col gap-1.5 pr-3">
              {items.map(item => (
                <div
                  key={item._id as string}
                  className="flex items-center justify-between gap-2 rounded-md border border-border/40 bg-muted/10 px-2.5 py-2 hover:bg-muted/20 transition-colors"
                >
                  <span className="text-xs font-medium truncate">{item.metadata?.title}</span>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1 shrink-0">
                    <Calendar className="size-3" />
                    {item.type === 'movie' ? (
                      item.metadata?.releaseDate
                        ? new Date(item.metadata.releaseDate).toLocaleDateString([], { month: 'short', day: 'numeric' })
                        : 'Soon'
                    ) : (
                      item.metadata?.nextEpisodeDate ? (
                        <>
                          {item.metadata.nextEpisodeNumber ? `Ep ${item.metadata.nextEpisodeNumber} • ` : ''}
                          {new Date(item.metadata.nextEpisodeDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </>
                      ) : 'Soon'
                    )}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}