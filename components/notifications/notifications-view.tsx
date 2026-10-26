"use client";

import { useState } from "react";
import { Notification } from "@/types/notification";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemGroup,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
} from "@/components/ui/item";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Bell, AlertTriangle, ChevronRight } from "lucide-react";
import {
  deleteNotificationAction,
} from "@/lib/actions/notifications";
import { completeReminderAction } from "@/lib/actions/reminders";
import { EmptyMuted } from "@/components/notifications/notification-menu";
import { useNotifications, refreshNotifications } from "@/components/notifications/notifications-provider";
import { toast } from "@/components/ui/toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface NotificationsContentProps {
  initialNotifications?: Notification[];
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  "reminder.due": <Bell className="size-4" />,
  "watchlist.release": <Bell className="size-4" />,
  "watchlist.episode": <Bell className="size-4" />,
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
        <img src={image} alt={title} />
      </ItemMedia>
    );
  }
  return (
    <ItemMedia className="text-primary mt-0.5">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
        {TYPE_ICON[type] ?? <AlertTriangle className="size-4" />}
      </div>
    </ItemMedia>
  );
}

export function NotificationsContent({ initialNotifications }: NotificationsContentProps) {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const unread = notifications.filter((n) => !n.readAt);

  const handleNotificationClick = async (id: string) => {
    await markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    const promise = markAllAsRead();
    toast.promise(promise, {
      loading: "Marking all as read...",
      success: "All notifications marked as read",
      error: "Failed to mark notifications as read",
    });
  };

  const handleDelete = async (id: string) => {
    const promise = deleteNotificationAction(id).then((res) => {
      if (!res.success) {
        throw new Error(res.error || "Failed to delete notification");
      }
      refreshNotifications();
      return res;
    });

    toast.promise(promise, {
      loading: "Deleting notification...",
      success: "Notification deleted",
      error: (err: any) => err?.message || "Failed to delete notification",
    });
  };

  const handleCompleteReminder = async (notificationId: string, reminderId: string) => {
    const promise = completeReminderAction(reminderId).then(async (res) => {
      if (!res.success) {
        throw new Error(res.error || "Failed to complete reminder");
      }
      await markAsRead(notificationId);
      refreshNotifications();
      return res;
    });

    toast.promise(promise, {
      loading: "Completing reminder...",
      success: "Reminder marked as complete",
      error: (err: any) => err?.message || "Failed to complete reminder",
    });
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
        <ItemGroup>
          {list.map((n) => {
            const isReminder = n.type === "reminder.due";
            const hasLink = !!n.link;

            return (
              <Item
                key={n._id as string}
                variant={!n.readAt ? "muted" : "outline"}
                className="items-start md:items-center justify-between cursor-pointer"
                render={
                  hasLink ? (
                    <Link
                      href={n.link!}
                      replace={true}
                      onClick={(e) => {
                        if (!n.readAt) {
                          e.preventDefault();
                          isReminder && n.reminderId
                            ? handleCompleteReminder(n._id as string, n.reminderId)
                            : handleNotificationClick(n._id as string);
                        }
                      }}
                    />
                  ) : undefined
                }
                onClick={!hasLink ? () => handleNotificationClick(n._id as string) : undefined}
                role={!hasLink ? "button" : undefined}
                tabIndex={!hasLink ? 0 : undefined}
                onKeyDown={!hasLink ? (e) => e.key === "Enter" && handleNotificationClick(n._id as string) : undefined}
              >
                <NotificationIcon type={n.type} image={n.image} title={n.title} />

                <ItemContent className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <ItemTitle>{n.title}</ItemTitle>
                    {!n.readAt && <Badge variant="secondary">New</Badge>}
                  </div>
                  <ItemDescription className="text-xs leading-relaxed mt-0.5">
                    {n.message}
                  </ItemDescription>
                  <span className="text-[10px] text-muted-foreground/60 font-medium mt-1 block">
                    {new Date(n.createdAt).toLocaleDateString()}{" "}
                    {new Date(n.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </ItemContent>

                <ItemActions className="self-end md:self-center shrink-0 mt-3 md:mt-0 ml-auto">
                  {n.readAt && <ChevronRight className="size-4" />}
                </ItemActions>
              </Item>
            );
          })}
        </ItemGroup>
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
