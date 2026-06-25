"use client";

import { useEffect, useState, useRef } from 'react';
import { Bell, Check, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Notification } from '@/features/notifications/schemas/notification';
import { getNotificationsAction, markNotificationReadAction, deleteNotificationAction } from '@/features/notifications/actions/notifications';
import { toast } from 'sonner';
import Link from 'next/link';
import gsap from 'gsap';

export function HeaderBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const bellRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);

  const unreadCount = notifications.filter(n => !n.readAt && !n.dismissedAt).length;

  const fetchNotifications = async () => {
    const res = await getNotificationsAction();
    if (res.success && res.data) {
      setNotifications(res.data);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Polling every 60s
    return () => clearInterval(interval);
  }, []);

  // Trigger GSAP ring animation when new unread notifications arrive
  useEffect(() => {
    if (unreadCount > 0 && bellRef.current) {
      const tl = gsap.timeline();
      tl.to(bellRef.current, { rotation: 15, duration: 0.1, yoyo: true, repeat: 5 })
        .to(bellRef.current, { rotation: -15, duration: 0.1, yoyo: true, repeat: 5 }, "<")
        .to(bellRef.current, { rotation: 0, duration: 0.1 });
    }
  }, [unreadCount]);

  const handleMarkRead = async (id: string) => {
    const res = await markNotificationReadAction(id);
    if (res.success) {
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, readAt: new Date() } : n));
    } else {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleDelete = async (id: string) => {
    const res = await deleteNotificationAction(id);
    if (res.success) {
      setNotifications(prev => prev.filter(n => n._id !== id));
      toast.success('Notification deleted');
    } else {
      toast.error('Failed to delete notification');
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          ref={bellRef}
          variant="ghost"
          size="icon"
          className="relative rounded-full hover:bg-accent hover:text-accent-foreground"
        >
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span ref={triggerRef} className="absolute top-1.5 right-1.5 flex size-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
              <span className="relative inline-flex rounded-full size-2.5 bg-destructive"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-2">
          <span className="font-semibold text-sm">Notifications ({unreadCount} unread)</span>
          <Link href="/notifications" className="text-xs text-primary hover:underline">
            View All
          </Link>
        </div>
        <ScrollArea className="h-64">
          {notifications.length === 0 ? (
            <div className="flex items-center justify-center h-full py-8 text-muted-foreground text-xs">
              No notifications yet.
            </div>
          ) : (
            <div className="divide-y">
              {notifications.slice(0, 5).map(n => (
                <div
                  key={n._id as string}
                  className={`p-3 text-xs transition-colors hover:bg-muted/50 ${!n.readAt ? 'bg-muted/30 font-medium' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-foreground">{n.title}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="mt-1 text-muted-foreground text-[11px] leading-normal">{n.message}</p>
                  <div className="flex items-center justify-end gap-1.5 mt-2">
                    {n.link && (
                      <Button asChild size="icon" variant="ghost" className="size-6">
                        <Link href={n.link}>
                          <ExternalLink className="size-3.5" />
                        </Link>
                      </Button>
                    )}
                    {!n.readAt && (
                      <Button onClick={() => handleMarkRead(n._id as string)} size="icon" variant="ghost" className="size-6 text-emerald-600">
                        <Check className="size-3.5" />
                      </Button>
                    )}
                    <Button onClick={() => handleDelete(n._id as string)} size="icon" variant="ghost" className="size-6 text-destructive">
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
