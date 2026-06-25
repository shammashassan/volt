"use client";

import { useState } from "react";
import { Notification } from "@/features/notifications/schemas/notification";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, Trash2, ExternalLink, Calendar, Bell, AlertTriangle } from "lucide-react";
import {
  markNotificationReadAction,
  deleteNotificationAction,
  getNotificationsAction,
} from "@/features/notifications/actions/notifications";
import { EmptyMuted } from "@/components/notification-menu";
import { toast } from "sonner";
import Link from "next/link";

interface NotificationsContentProps {
  initialNotifications: Notification[];
}

export function NotificationsContent({ initialNotifications }: NotificationsContentProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const unread = notifications.filter((n) => !n.readAt);

  const fetchNotifications = async () => {
    const res = await getNotificationsAction();
    if (res.success && res.data) setNotifications(res.data);
  };

  const handleMarkRead = async (id: string) => {
    const res = await markNotificationReadAction(id);
    if (res.success) {
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, readAt: new Date() } : n))
      );
      toast.success("Notification marked as read");
    } else {
      toast.error("Failed to mark notification as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadList = notifications.filter((n) => !n.readAt);
    if (unreadList.length === 0) return;
    const res = await Promise.all(
      unreadList.map((n) => markNotificationReadAction(n._id as string))
    );
    if (res.some((r) => !r.success)) {
      toast.error("Failed to mark some notifications as read");
    } else {
      toast.success("All notifications marked as read");
    }
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, readAt: n.readAt || new Date() }))
    );
  };

  const handleDelete = async (id: string) => {
    const res = await deleteNotificationAction(id);
    if (res.success) {
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      toast.success("Notification deleted");
    } else {
      toast.error("Failed to delete notification");
    }
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case "reminder.due":
        return <Calendar />;
      case "watchlist.release":
      case "watchlist.episode":
        return <Bell />;
      default:
        return <AlertTriangle />;
    }
  };

  const groupNotifications = (list: Notification[]) => {
    const today: Notification[] = [];
    const yesterday: Notification[] = [];
    const older: Notification[] = [];

    const todayStr = new Date().toDateString();
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = yesterdayDate.toDateString();

    list.forEach((n) => {
      const dateStr = new Date(n.createdAt).toDateString();
      if (dateStr === todayStr) today.push(n);
      else if (dateStr === yesterdayStr) yesterday.push(n);
      else older.push(n);
    });

    return { today, yesterday, older };
  };

  const { today, yesterday, older } = groupNotifications(notifications);

  const renderSection = (title: string, list: Notification[]) => {
    if (list.length === 0) return null;
    return (
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground px-1">
          {title}
        </h3>
        <div className="flex flex-col gap-3">
          {list.map((n) => (
            <Card
              key={n._id as string}
              className={!n.readAt ? "border-l-primary border-l-2" : ""}
            >
              <CardContent className="flex items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="mt-0.5 rounded-xl p-2.5 bg-primary/10 text-primary shrink-0">
                    {renderIcon(n.type)}
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-sm">{n.title}</span>
                      {!n.readAt && <Badge variant="secondary">New</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">
                      {n.message}
                    </p>
                    <span className="text-[10px] text-muted-foreground/60 font-medium">
                      {new Date(n.createdAt).toLocaleDateString()}{" "}
                      {new Date(n.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {n.link && (
                    <Button asChild variant="outline" size="sm">
                      <Link href={n.link}>
                        <ExternalLink data-icon="inline-start" />
                        Go to item
                      </Link>
                    </Button>
                  )}
                  {!n.readAt && (
                    <Button
                      onClick={() => handleMarkRead(n._id as string)}
                      variant="ghost"
                      size="icon"
                    >
                      <Check />
                    </Button>
                  )}
                  <Button
                    onClick={() => handleDelete(n._id as string)}
                    variant="ghost"
                    size="icon"
                  >
                    <Trash2 />
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
    <div className="flex flex-1 flex-col gap-6 pb-12">
      {/* Header */}
      <section className="px-4 pt-8 lg:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between max-w-7xl">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Bell />
              </div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-black tracking-tight md:text-4xl bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/60">
                  Notifications
                </h1>
                <Badge variant="outline" className="rounded-full">
                  {unread.length} Unread
                </Badge>
              </div>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl font-medium">
              View and manage your alerts, reminders, and activities.
            </p>
          </div>
          <Button
            onClick={handleMarkAllAsRead}
            variant="outline"
            className="w-full sm:w-auto shrink-0"
            disabled={unread.length === 0}
          >
            Mark all as read
          </Button>
        </div>
      </section>

      <Separator />

      {/* Content */}
      {notifications.length === 0 ? (
        <section className="px-4 lg:px-6">
          <div className="max-w-7xl border border-dashed rounded-2xl">
            <EmptyMuted onRefresh={fetchNotifications} />
          </div>
        </section>
      ) : (
        <section className="px-4 lg:px-6">
          <div className="max-w-7xl flex flex-col gap-8">
            {renderSection("Today", today)}
            {renderSection("Yesterday", yesterday)}
            {renderSection("Earlier", older)}
          </div>
        </section>
      )}
    </div>
  );
}
