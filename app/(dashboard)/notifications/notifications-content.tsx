"use client";

import { useState } from 'react';
import { Notification } from '@/features/notifications/schemas/notification';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Trash2, ExternalLink, Calendar, Bell, AlertTriangle } from 'lucide-react';
import { markNotificationReadAction, deleteNotificationAction } from '@/features/notifications/actions/notifications';
import { toast } from 'sonner';
import Link from 'next/link';

interface NotificationsContentProps {
  initialNotifications: Notification[];
}

export function NotificationsContent({ initialNotifications }: NotificationsContentProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const unread = notifications.filter(n => !n.readAt);
  const read = notifications.filter(n => n.readAt);

  const handleMarkRead = async (id: string) => {
    const res = await markNotificationReadAction(id);
    if (res.success) {
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, readAt: new Date() } : n));
      toast.success('Notification marked as read');
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

  const renderIcon = (type: string) => {
    switch (type) {
      case 'reminder.due':
        return <Calendar className="size-4 text-violet-500" />;
      case 'watchlist.release':
      case 'watchlist.episode':
        return <Bell className="size-4 text-amber-500" />;
      default:
        return <AlertTriangle className="size-4 text-blue-500" />;
    }
  };

  const groupNotifications = (list: Notification[]) => {
    const today: Notification[] = [];
    const yesterday: Notification[] = [];
    const older: Notification[] = [];

    const now = new Date();
    const todayStr = now.toDateString();
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = yesterdayDate.toDateString();

    list.forEach(n => {
      const dateStr = new Date(n.createdAt).toDateString();
      if (dateStr === todayStr) {
        today.push(n);
      } else if (dateStr === yesterdayStr) {
        yesterday.push(n);
      } else {
        older.push(n);
      }
    });

    return { today, yesterday, older };
  };

  const { today, yesterday, older } = groupNotifications(notifications);

  const renderSection = (title: string, list: Notification[]) => {
    if (list.length === 0) return null;
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground">{title}</h3>
        <div className="grid gap-3">
          {list.map(n => (
            <Card key={n._id as string} className={`overflow-hidden transition-all hover:shadow-md ${!n.readAt ? 'border-l-4 border-l-primary' : ''}`}>
              <CardContent className="flex items-center justify-between p-4 gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full p-2 bg-muted">
                    {renderIcon(n.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{n.title}</span>
                      {!n.readAt && <Badge variant="secondary">New</Badge>}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground leading-normal">{n.message}</p>
                    <span className="mt-2 block text-[10px] text-muted-foreground">
                      {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {n.link && (
                    <Button asChild variant="outline" size="sm">
                      <Link href={n.link}>
                        <ExternalLink className="size-4 mr-1.5" />
                        Go to item
                      </Link>
                    </Button>
                  )}
                  {!n.readAt && (
                    <Button onClick={() => handleMarkRead(n._id as string)} variant="ghost" size="icon" className="text-emerald-600 hover:text-emerald-700">
                      <Check className="size-4" />
                    </Button>
                  )}
                  <Button onClick={() => handleDelete(n._id as string)} variant="ghost" size="icon" className="text-destructive hover:text-destructive/80">
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center border border-dashed rounded-lg p-12 text-center text-muted-foreground text-sm">
          No notifications found.
        </div>
      ) : (
        <>
          {renderSection('Today', today)}
          {renderSection('Yesterday', yesterday)}
          {renderSection('Earlier', older)}
        </>
      )}
    </div>
  );
}
