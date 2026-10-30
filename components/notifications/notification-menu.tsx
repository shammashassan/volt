"use client";

import { Bell as BellIcon, BellDot, RefreshCcw as RefreshCcwIcon, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
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
import { useNotifications } from "./notifications-provider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { completeReminderAction } from "@/lib/actions/reminders";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { ScrollArea } from "@/components/ui/scroll-area";

const TYPE_ICON: Record<string, React.ReactNode> = {
  "reminder.due": <BellIcon className="size-3.5" />,
  "watchlist.release": <BellIcon className="size-3.5" />,
  "watchlist.episode": <BellIcon className="size-3.5" />,
};

function NotificationIcon({
  type,
  image,
  title,
}: {
  type: string;
  image?: string;
  title: string;
}) {
  if (image && (type === "watchlist.release" || type === "watchlist.episode")) {
    return (
      <ItemMedia variant="image" className="mt-0.5">
        <img src={image} alt={title} className="rounded-sm" />
      </ItemMedia>
    );
  }
  return (
    <ItemMedia className="mt-0.5">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        {TYPE_ICON[type] ?? <AlertTriangle className="size-3.5" />}
      </div>
    </ItemMedia>
  );
}

function Dot() {
  return (
    <span
      aria-hidden="true"
      className="size-1.5 rounded-full bg-primary block"
    />
  );
}

export function EmptyMuted({ onRefresh }: { onRefresh?: () => void }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <BellIcon />
        </EmptyMedia>
        <EmptyTitle>No Notifications</EmptyTitle>
        <EmptyDescription className="max-w-50">
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

function formatRelativeTime(date: Date) {
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
}

export function NotificationMenu() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    hasNotifications,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const handleOpenChange = (open: boolean) => {
    if (open) {
      fetchNotifications();
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleNotificationClick = async (id: string) => {
    await markAsRead(id);
  };

  const handleCompleteReminderClick = async (notificationId: string, reminderId: string) => {
    await completeReminderAction(reminderId);
    await markAsRead(notificationId);
    router.refresh();
  };

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger
        render={
          <Button
            aria-label={unreadCount > 0 ? `Open notifications (${unreadCount} unread)` : "Open notifications"}
            size="icon"
            variant="ghost"
          />
        }
      >
        {unreadCount > 0 ? (
          <BellDot
            className="[&_circle]:fill-primary [&_circle]:stroke-primary"
            aria-hidden="true"
          />
        ) : (
          <BellIcon aria-hidden="true" />
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80" align="end">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2.5">
          <span className="text-sm font-semibold">Notifications</span>
          <Button
            variant="ghost"
            size="xs"
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
          <ScrollArea className="h-75">
            <div className="p-1 pr-3">
              <DropdownMenuGroup>
                {notifications.slice(0, 5).map((notification) => {
                  const isReminder = notification.type === "reminder.due";
                  const hasLink = !!notification.link;

                  if (hasLink) {
                    return (
                      <DropdownMenuItem
                        key={notification._id as string}
                        className="first:mt-0.5 last:mb-0.5"
                        render={
                          <Link
                            href={notification.link!}
                            onClick={(e) => {
                              if (!notification.readAt) {
                                e.preventDefault();
                                if (isReminder && notification.reminderId) {
                                  handleCompleteReminderClick(notification._id as string, notification.reminderId);
                                } else {
                                  handleNotificationClick(notification._id as string);
                                }
                              }
                              // already read → navigate naturally
                            }}
                          />
                        }
                      >
                        <Item size="xs" className="w-full">
                          <NotificationIcon
                            type={notification.type}
                            image={notification.image}
                            title={notification.title}
                          />

                          <ItemContent>
                            <ItemTitle>
                              <span className={cn(notification.readAt && "text-muted-foreground")}>
                                {notification.title}
                              </span>
                            </ItemTitle>
                            <ItemDescription>
                              {notification.message}
                            </ItemDescription>
                            <span
                              className={cn(
                                "text-[10px] mt-1 block leading-none",
                                !notification.readAt
                                  ? "text-muted-foreground/60 group-focus/dropdown-menu-item:text-muted-foreground/60!"
                                  : "text-muted-foreground/40 group-focus/dropdown-menu-item:text-muted-foreground/40!"
                              )}
                            >
                              {formatRelativeTime(notification.createdAt)}
                            </span>
                          </ItemContent>

                          {!notification.readAt && (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                              <span className="sr-only">Unread</span>
                              <Dot />
                            </div>
                          )}
                        </Item>
                      </DropdownMenuItem>
                    );
                  }

                  // No-link notification — click to mark read
                  return (
                    <DropdownMenuItem
                      key={notification._id as string}
                      className="first:mt-0.5 last:mb-0.5"
                      onClick={() => handleNotificationClick(notification._id as string)}
                    >
                      <Item size="xs" className="w-full">
                        <NotificationIcon
                          type={notification.type}
                          image={notification.image}
                          title={notification.title}
                        />

                        <ItemContent>
                          <ItemTitle>
                            <span className={cn(notification.readAt && "text-muted-foreground")}>
                              {notification.title}
                            </span>
                          </ItemTitle>
                          <ItemDescription>
                            {notification.message}
                          </ItemDescription>
                          <span
                            className={cn(
                              "text-[10px] mt-1 block leading-none",
                              !notification.readAt
                                ? "text-muted-foreground/60 group-focus/dropdown-menu-item:text-muted-foreground/60!"
                                : "text-muted-foreground/40 group-focus/dropdown-menu-item:text-muted-foreground/40!"
                            )}
                          >
                            {formatRelativeTime(notification.createdAt)}
                          </span>
                        </ItemContent>

                        {!notification.readAt && (
                          <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            <span className="sr-only">Unread</span>
                            <Dot />
                          </div>
                        )}
                      </Item>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuGroup>
            </div>
          </ScrollArea>
        )}

        <Separator />

        {/* Footer */}
        <div className="p-1 pt-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => router.push("/notifications")}
          >
            View all notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
