"use client";

import { useState } from "react";
import { Notification } from "@/features/notifications/schemas/notification";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

const TYPE_ICON: Record<string, React.ReactNode> = {
  "reminder.due": <Calendar />,
  "watchlist.release": <Bell />,
  "watchlist.episode": <Bell />,
};

function NotificationIcon({ type }: { type: string }) {
  return (
    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
      {TYPE_ICON[type] ?? <AlertTriangle />}
    </div>
  );
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
      toast.success("Marked as read");
    } else {
      toast.error("Failed to mark as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadList = notifications.filter((n) => !n.readAt);
    if (unreadList.length === 0) return;
    await Promise.all(unreadList.map((n) => markNotificationReadAction(n._id as string)));
    setNotifications((prev) => prev.map((n) => ({ ...n, readAt: n.readAt || new Date() })));
    toast.success("All notifications marked as read");
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

  const groupNotifications = (list: Notification[]) => {
    const today: Notification[] = [];
    const yesterday: Notification[] = [];
    const older: Notification[] = [];
    const todayStr = new Date().toDateString();
    const yDate = new Date();
    yDate.setDate(yDate.getDate() - 1);
    const yStr = yDate.toDateString();
    list.forEach((n) => {
      const d = new Date(n.createdAt).toDateString();
      if (d === todayStr) today.push(n);
      else if (d === yStr) yesterday.push(n);
      else older.push(n);
    });
    return { today, yesterday, older };
  };

  const { today, yesterday, older } = groupNotifications(notifications);

  const renderSection = (title: string, list: Notification[]) => {
    if (list.length === 0) return null;
    return (
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
          {title}
        </h3>
        {list.map((n) => (
          <Card
            key={n._id as string}
            className={!n.readAt ? "border-l-2 border-l-primary" : ""}
          >
            <CardHeader className="flex-row items-start gap-3">
              <NotificationIcon type={n.type} />
              <div className="flex flex-1 flex-col gap-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-sm font-semibold leading-none">
                    {n.title}
                  </CardTitle>
                  {!n.readAt && <Badge variant="secondary">New</Badge>}
                </div>
                <CardDescription className="text-xs leading-relaxed">
                  {n.message}
                </CardDescription>
                <span className="text-[10px] text-muted-foreground/60 font-medium mt-0.5">
                  {new Date(n.createdAt).toLocaleDateString()}{" "}
                  {new Date(n.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </CardHeader>
            <CardFooter className="flex justify-end gap-1.5">
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
                  variant="outline"
                  size="sm"
                >
                  <Check data-icon="inline-start" />
                  Mark read
                </Button>
              )}
              <Button
                onClick={() => handleDelete(n._id as string)}
                variant="ghost"
                size="icon"
              >
                <Trash2 />
              </Button>
            </CardFooter>
          </Card>
        ))}
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
