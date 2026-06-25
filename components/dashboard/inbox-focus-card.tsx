"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  return (
    <Card className="h-full flex flex-col border-border/50 bg-card/60 shadow-sm backdrop-blur-sm">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-semibold italic lowercase flex items-center gap-1.5 text-muted-foreground/90">
          <Target className="size-4 text-primary" />
          today's focus
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2.5 px-4 pb-4">
        <Link
          href="/reminders"
          className="flex items-center gap-2.5 p-2 rounded-lg border border-border/60 bg-muted/20 hover:bg-accent/50 transition-colors"
        >
          <AlertCircle className="size-4 shrink-0 text-violet-500" />
          <div className="flex flex-col min-w-0">
            <span className="text-lg font-bold leading-none">{remindersCount}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider truncate">Reminders</span>
          </div>
        </Link>
        <Link
          href="/media-watchlist"
          className="flex items-center gap-2.5 p-2 rounded-lg border border-border/60 bg-muted/20 hover:bg-accent/50 transition-colors"
        >
          <PlayCircle className="size-4 shrink-0 text-amber-500" />
          <div className="flex flex-col min-w-0">
            <span className="text-lg font-bold leading-none">{releasesCount}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider truncate">Releases</span>
          </div>
        </Link>
        <Link
          href="/notifications"
          className="flex items-center gap-2.5 p-2 rounded-lg border border-border/60 bg-muted/20 hover:bg-accent/50 transition-colors"
        >
          <Bell className="size-4 shrink-0 text-rose-500" />
          <div className="flex flex-col min-w-0">
            <span className="text-lg font-bold leading-none">{unreadNotifications}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider truncate">Unread</span>
          </div>
        </Link>
        <div className="flex items-center gap-2.5 p-2 rounded-lg border border-border/60 bg-muted/20">
          <FolderMinus className="size-4 shrink-0 text-indigo-500" />
          <div className="flex flex-col min-w-0">
            <span className="text-lg font-bold leading-none">{inboxCount}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider truncate">Inbox</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}