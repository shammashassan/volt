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
          item => (item.status === 'planning' || item.status === 'planned') && item.metadata?.releaseDate && new Date(item.metadata.releaseDate) > now
        );
        setItems(upcoming.slice(0, 3));
      }
    }
    load();
  }, []);

  return (
    <Card className="workspace-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
          <Film className="size-4 text-amber-500" />
          Upcoming Releases
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">No upcoming releases soon.</p>
        ) : (
          items.map(item => (
            <div key={item._id as string} className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium truncate">{item.metadata?.title}</span>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1 shrink-0">
                <Calendar className="size-3" />
                {item.metadata?.releaseDate ? new Date(item.metadata.releaseDate).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Soon'}
              </span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
