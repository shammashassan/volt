"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Film, Calendar } from 'lucide-react';
import { getWatchlistAction } from '@/app/(dashboard)/media-watchlist/_actions/get-watchlist';
import { WatchlistItem } from '@/app/(dashboard)/media-watchlist/_types/watchlist.types';

export function WatchlistUpcomingCard() {
  const [items, setItems] = useState<WatchlistItem[]>([]);

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
        setItems(upcoming.slice(0, 3));
      }
    }
    load();
  }, []);

  return (
    <Card className="h-full flex flex-col border-border/50 bg-card/60 shadow-sm backdrop-blur-sm">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-semibold italic lowercase flex items-center gap-1.5 text-muted-foreground/90">
          <Film className="size-4 text-amber-500" />
          upcoming releases
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 px-4 pb-4">
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">No upcoming releases soon.</p>
        ) : (
          items.map(item => (
            <div
              key={item._id as string}
              className="flex items-center justify-between gap-2 rounded-md border border-border/40 bg-muted/10 px-2.5 py-2"
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