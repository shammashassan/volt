"use client";

import { useEffect, useState } from "react";
import { BellIcon, RefreshCcwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Notification } from "@/features/notifications/schemas/notification";
import {
  getNotificationsAction,
  markNotificationReadAction,
} from "@/features/notifications/actions/notifications";
import { useRouter } from "next/navigation";

function Dot() {
  return (
    <svg
      aria-hidden="true"
      className="text-primary"
      fill="currentColor"
      height="6"
      viewBox="0 0 6 6"
      width="6"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="3" cy="3" r="3" />
    </svg>
  );
}

export function EmptyMuted({ onRefresh }: { onRefresh?: () => void }) {
  return (
    <Empty className="py-8 border-0">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <BellIcon />
        </EmptyMedia>
        <EmptyTitle>No Notifications</EmptyTitle>
        <EmptyDescription className="max-w-[200px] text-pretty">
          You&apos;re all caught up. New notifications will appear here.
        </EmptyDescription>
      </EmptyHeader>
      {onRefresh && (
        <EmptyContent>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCcwIcon data-icon="inline-start" />
            Refresh
          </Button>
        </EmptyContent>
      )}
    </Empty>
  );
}

export function NotificationMenu() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const router = useRouter();
  const unreadCount = notifications.filter((n) => !n.readAt).length;
  const hasNotifications = notifications.length > 0;

  const fetchNotifications = async () => {
    const res = await getNotificationsAction();
    if (res.success && res.data) {
      setNotifications(res.data);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenChange = (open: boolean) => {
    if (open) {
      fetchNotifications();
    }
  };

  const handleMarkAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.readAt);
    if (unread.length === 0) return;
    await Promise.all(
      unread.map((n) => markNotificationReadAction(n._id as string))
    );
    setNotifications(
      notifications.map((n) => ({ ...n, readAt: n.readAt || new Date() }))
    );
  };

  const handleNotificationClick = async (id: string, link?: string) => {
    await markNotificationReadAction(id);
    setNotifications(
      notifications.map((n) =>
        n._id === id ? { ...n, readAt: new Date() } : n
      )
    );
    if (link) router.push(link);
  };

  const getRelativeTime = (date: Date) => {
    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
    const elapsed = new Date(date).getTime() - Date.now();
    const seconds = Math.round(elapsed / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);
    if (Math.abs(days) > 0) return rtf.format(days, "day");
    if (Math.abs(hours) > 0) return rtf.format(hours, "hour");
    if (Math.abs(minutes) > 0) return rtf.format(minutes, "minute");
    return "just now";
  };

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label="Open notifications"
          size="icon"
          variant="ghost"
          className="relative"
        >
          <BellIcon aria-hidden="true" />
          {unreadCount > 0 && (
            <span
              aria-hidden="true"
              className="absolute top-1 right-1 size-1.5 rounded-full bg-primary"
            />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80 p-0" align="end">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2.5">
          <span className="text-sm font-semibold">Notifications</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto px-0 text-xs text-muted-foreground font-medium hover:text-foreground hover:bg-transparent"
            disabled={unreadCount === 0}
            onClick={handleMarkAllAsRead}
          >
            Mark all as read
          </Button>
        </div>

        <Separator />

        {/* Body */}
        {!hasNotifications ? (
          <EmptyMuted onRefresh={fetchNotifications} />
        ) : (
          <div className="max-h-[300px] overflow-y-auto">
            {notifications.slice(0, 5).map((notification) => (
              <button
                key={notification._id as string}
                type="button"
                className="w-full text-left px-3 py-2.5 text-sm transition-colors hover:bg-accent relative flex items-start gap-2"
                onClick={() =>
                  handleNotificationClick(
                    notification._id as string,
                    notification.link
                  )
                }
              >
                <div className="flex-1 flex flex-col gap-0.5 min-w-0 pe-3">
                  <span className="font-medium text-foreground leading-snug">
                    {notification.title}
                  </span>
                  <span className="text-muted-foreground text-xs leading-snug truncate">
                    {notification.message}
                  </span>
                  <span className="text-muted-foreground/60 text-[10px] mt-0.5">
                    {getRelativeTime(notification.createdAt)}
                  </span>
                </div>
                {!notification.readAt && (
                  <div className="absolute inset-e-3 top-1/2 -translate-y-1/2">
                    <span className="sr-only">Unread</span>
                    <Dot />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        <Separator />

        {/* Footer */}
        <div className="p-1">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs text-muted-foreground font-medium"
            onClick={() => router.push("/notifications")}
          >
            View all notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
