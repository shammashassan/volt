"use client";

import { useEffect, useState } from "react";
import { BellIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Notification } from "@/features/notifications/schemas/notification";
import { getNotificationsAction, markNotificationReadAction } from "@/features/notifications/actions/notifications";
import { useRouter } from "next/navigation";

function Dot({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
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

export function HeaderBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const router = useRouter();
  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const fetchNotifications = async () => {
    const res = await getNotificationsAction();
    if (res.success && res.data) {
      setNotifications(res.data);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Poll every 60s
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllAsRead = async () => {
    const unread = notifications.filter(n => !n.readAt);
    for (const n of unread) {
      await markNotificationReadAction(n._id as string);
    }
    setNotifications(
      notifications.map((notification) => ({
        ...notification,
        readAt: new Date(),
      })),
    );
  };

  const handleNotificationClick = async (id: string, link?: string) => {
    await markNotificationReadAction(id);
    setNotifications(
      notifications.map((notification) =>
        notification._id === id
          ? { ...notification, readAt: new Date() }
          : notification,
      ),
    );
    if (link) {
      router.push(link);
    }
  };

  const getRelativeTime = (date: Date) => {
    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
    const elapsed = new Date(date).getTime() - new Date().getTime();
    
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
    <Popover>
      <PopoverTrigger asChild>
        <Button
          aria-label="Open notifications"
          className="relative size-8 rounded-full text-muted-foreground shadow-none"
          size="icon"
          variant="ghost"
        >
          <BellIcon aria-hidden="true" size={16} />
          {unreadCount > 0 && (
            <div
              aria-hidden="true"
              className="absolute top-0.5 right-0.5 size-1 rounded-full bg-primary"
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-1" align="end">
        <div className="flex items-baseline justify-between gap-4 px-3 py-2">
          <div className="font-semibold text-sm">Notifications</div>
          {unreadCount > 0 && (
            <button
              className="font-medium text-xs hover:underline cursor-pointer"
              onClick={handleMarkAllAsRead}
              type="button"
            >
              Mark all as read
            </button>
          )}
        </div>
        <div
          aria-orientation="horizontal"
          className="-mx-1 my-1 h-px bg-border"
          role="separator"
          tabIndex={-1}
        />
        {notifications.length === 0 ? (
          <div className="text-center py-6 text-xs text-muted-foreground">
            No notifications yet.
          </div>
        ) : (
          notifications.slice(0, 6).map((notification) => (
            <div
              className="rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent relative"
              key={notification._id as string}
            >
              <div className="relative flex items-start pe-3">
                <div className="flex-1 space-y-1">
                  <button
                    className="text-left text-foreground/80 after:absolute after:inset-0 cursor-pointer"
                    onClick={() => handleNotificationClick(notification._id as string, notification.link)}
                    type="button"
                  >
                    <span className="font-medium text-foreground">
                      {notification.title}
                    </span>{" "}
                    {notification.message}
                  </button>
                  <div className="text-muted-foreground text-xs">
                    {getRelativeTime(notification.createdAt)}
                  </div>
                </div>
                {!notification.readAt && (
                  <div className="absolute end-0 self-center">
                    <span className="sr-only">Unread</span>
                    <Dot className="text-primary" />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </PopoverContent>
    </Popover>
  );
}
