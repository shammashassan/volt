"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
          item =>
            (item.status === 'planning' || item.status === 'planned') &&
            item.metadata?.releaseDate &&
            new Date(item.metadata.releaseDate) > now
        );
        setItems(upcoming.slice(0, 4));
      }
      setLoaded(true);
    }
    load();
  }, []);

  return (
    <Card className="h-full flex flex-col border-border/50 bg-card/60 shadow-sm backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center gap-0 p-4 pb-3">
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
            className="text-[10px] text-primary/70 hover:text-primary hover:underline"
          >
            View all →
          </Link>
        )}
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-1.5 p-4 pt-0">
        {!loaded ? (
          [1, 2, 3].map(i => (
            <div key={i} className="flex items-center justify-between rounded-md border border-border/30 bg-muted/10 px-2.5 py-2">
              <div className="h-2.5 w-28 animate-pulse rounded bg-muted/40" />
              <div className="h-2 w-12 animate-pulse rounded bg-muted/30" />
            </div>
          ))
        ) : items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/40 bg-muted/10 py-5">
            <div className="flex size-8 items-center justify-center rounded-full bg-amber-500/10">
              <Telescope className="size-4 text-amber-500/70" />
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <p className="text-xs font-medium text-foreground">Nothing on the horizon</p>
              <p className="text-[10px] text-muted-foreground/60 text-center">No planned releases coming up.</p>
            </div>
            <Link href="/media-watchlist" className="text-[10px] text-primary hover:underline">
              Add to watchlist →
            </Link>
          </div>
        ) : (
          items.map(item => (
            <div
              key={item._id as string}
              className="flex items-center justify-between gap-2 rounded-md border border-border/40 bg-muted/10 px-2.5 py-2 hover:bg-muted/20 transition-colors"
            >
              <span className="text-xs font-medium truncate">{item.metadata?.title}</span>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1 shrink-0">
                <Calendar className="size-3" />
                {item.metadata?.releaseDate
                  ? new Date(item.metadata.releaseDate).toLocaleDateString([], { month: 'short', day: 'numeric' })
                  : 'Soon'}
              </span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}