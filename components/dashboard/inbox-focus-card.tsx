"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, AlertCircle, PlayCircle, FolderMinus } from 'lucide-react';
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
    <Card className="workspace-card bg-muted/20 border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-primary">
          <Target className="size-4" />
          Today's Focus
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <Link href="/reminders" className="flex items-center gap-3 p-3 rounded-lg border bg-background hover:bg-accent/50 transition-colors">
          <AlertCircle className="size-5 text-violet-500" />
          <div className="flex flex-col">
            <span className="text-xl font-bold">{remindersCount}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Reminders</span>
          </div>
        </Link>
        <Link href="/media-watchlist" className="flex items-center gap-3 p-3 rounded-lg border bg-background hover:bg-accent/50 transition-colors">
          <PlayCircle className="size-5 text-amber-500" />
          <div className="flex flex-col">
            <span className="text-xl font-bold">{releasesCount}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Releases</span>
          </div>
        </Link>
        <Link href="/notifications" className="flex items-center gap-3 p-3 rounded-lg border bg-background hover:bg-accent/50 transition-colors">
          <BellIcon className="size-5 text-rose-500" />
          <div className="flex flex-col">
            <span className="text-xl font-bold">{unreadNotifications}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Unread Alerts</span>
          </div>
        </Link>
        <div className="flex items-center gap-3 p-3 rounded-lg border bg-background">
          <FolderMinus className="size-5 text-indigo-500" />
          <div className="flex flex-col">
            <span className="text-xl font-bold">{inboxCount}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Inbox Items</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
    </svg>
  );
}
