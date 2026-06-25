"use client";

import { useEffect, useState } from "react";
import { BellIcon, RefreshCcwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
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

export function EmptyMuted({ onRefresh }: { onRefresh?: () => void }) {
  return (
    <Empty className="h-full bg-muted/30 py-8 border-0 rounded-none">
      <EmptyHeader className="max-w-xs">
        <EmptyMedia variant="icon" className="bg-primary/10 text-primary">
          <BellIcon className="size-4" />
        </EmptyMedia>
        <EmptyTitle className="text-sm font-semibold">No Notifications</EmptyTitle>
        <EmptyDescription className="max-w-[220px] text-pretty text-xs text-muted-foreground/80">
          You&apos;re all caught up. New notifications will appear here.
        </EmptyDescription>
      </EmptyHeader>
      {onRefresh && (
        <EmptyContent className="mt-2">
          <Button variant="outline" size="sm" onClick={onRefresh} className="h-8 gap-1.5 cursor-pointer">
            <RefreshCcwIcon className="size-3" />
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
    if (unread.length === 0) return;
    await Promise.all(unread.map(n => markNotificationReadAction(n._id as string)));
    setNotifications(
      notifications.map((notification) => ({
        ...notification,
        readAt: notification.readAt || new Date(),
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
          className="relative size-8 rounded-full text-muted-foreground shadow-none cursor-pointer"
          size="icon"
          variant="ghost"
        >
          <BellIcon aria-hidden="true" size={16} />
          {unreadCount > 0 && (
            <div
              aria-hidden="true"
              className="absolute top-0.5 right-0.5 size-1.5 rounded-full bg-primary"
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-1" align="end">
        <div className="flex items-baseline justify-between gap-4 px-3 py-2">
          <div className="font-semibold text-sm">Notifications</div>
          {unreadCount > 0 && (
            <button
              className="font-medium text-xs hover:underline cursor-pointer text-muted-foreground hover:text-foreground"
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
          <EmptyMuted onRefresh={fetchNotifications} />
        ) : (
          <>
            <div className="max-h-[300px] overflow-y-auto space-y-0.5">
              {notifications.slice(0, 5).map((notification) => (
                <div
                  className="rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent relative"
                  key={notification._id as string}
                >
                  <div className="relative flex items-start pe-3">
                    <div className="flex-1 space-y-0.5">
                      <button
                        className="text-left text-foreground/80 after:absolute after:inset-0 cursor-pointer"
                        onClick={() => handleNotificationClick(notification._id as string, notification.link)}
                        type="button"
                      >
                        <span className="font-medium text-foreground hover:underline">
                          {notification.title}
                        </span>{" "}
                        <span className="text-muted-foreground/90">
                          {notification.message}
                        </span>
                      </button>
                      <div className="text-muted-foreground/60 text-[10px]">
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
              ))}
            </div>
            <div
              aria-orientation="horizontal"
              className="-mx-1 my-1 h-px bg-border"
              role="separator"
              tabIndex={-1}
            />
            <div className="p-1">
              <Button
                variant="ghost"
                className="w-full text-xs h-8 text-muted-foreground hover:text-foreground font-medium cursor-pointer"
                onClick={() => {
                  router.push("/notifications");
                }}
              >
                Read all
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
