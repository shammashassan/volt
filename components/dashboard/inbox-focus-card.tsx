"use client";

import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, AlertCircle, PlayCircle, FolderMinus, Bell } from 'lucide-react';
import Link from 'next/link';

interface InboxFocusProps {
  remindersCount: number;
  releasesCount: number;
  unreadNotifications: number;
  inboxCount: number;
}

export function InboxFocusCard({
  remindersCount,
  releasesCount,
  unreadNotifications,
  inboxCount
}: InboxFocusProps) {
  const totalItems = remindersCount + releasesCount + unreadNotifications + inboxCount;

  return (
    <Card size="sm" className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>
          <span className="flex items-center gap-2">
            <Target className="size-4 text-primary" />
            <span className="text-muted-foreground">Today&apos;s Focus</span>
          </span>
        </CardTitle>
        <CardAction>
          <span className="font-mono text-xs text-muted-foreground/60 tabular-nums">
            {totalItems} items
          </span>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <div className="grid grid-cols-2 gap-2.5 h-full">
          <Link
            href="/reminders"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-border/60 bg-muted/20 hover:bg-accent/50 transition-colors"
          >
            <AlertCircle className="size-4 shrink-0 text-violet-500" />
            <div className="flex flex-col min-w-0">
              <span className="text-xl font-bold leading-none tracking-tight">{remindersCount}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider truncate mt-1">Reminders</span>
            </div>
          </Link>
          <Link
            href="/media-watchlist"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-border/60 bg-muted/20 hover:bg-accent/50 transition-colors"
          >
            <PlayCircle className="size-4 shrink-0 text-amber-500" />
            <div className="flex flex-col min-w-0">
              <span className="text-xl font-bold leading-none tracking-tight">{releasesCount}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider truncate mt-1">Releases</span>
            </div>
          </Link>
          <Link
            href="/notifications"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-border/60 bg-muted/20 hover:bg-accent/50 transition-colors"
          >
            <Bell className="size-4 shrink-0 text-rose-500" />
            <div className="flex flex-col min-w-0">
              <span className="text-xl font-bold leading-none tracking-tight">{unreadNotifications}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider truncate mt-1">Unread</span>
            </div>
          </Link>
          <Link
            href="/resources?category=none"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-border/60 bg-muted/20 hover:bg-accent/50 transition-colors"
          >
            <FolderMinus className="size-4 shrink-0 text-indigo-500" />
            <div className="flex flex-col min-w-0">
              <span className="text-xl font-bold leading-none tracking-tight">{inboxCount}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider truncate mt-1">Uncategorized</span>
            </div>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
