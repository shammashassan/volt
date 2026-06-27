"use client";

import { useState, useEffect } from "react";
import { Notification } from "@/features/notifications/schemas/notification";
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
import { Bell, AlertTriangle, ChevronRight, CheckCheck } from "lucide-react";
import {
  markNotificationReadAction,
  deleteNotificationAction,
  getNotificationsAction,
} from "@/features/notifications/actions/notifications";
import { completeReminderAction } from "@/features/reminders/actions/reminders";
import { EmptyMuted } from "@/components/notification-menu";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface NotificationsContentProps {
  initialNotifications: Notification[];
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
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  useEffect(() => {
    setNotifications(initialNotifications);
  }, [initialNotifications]);

  useEffect(() => {
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const unread = notifications.filter((n) => !n.readAt);

  const fetchNotifications = async () => {
    const res = await getNotificationsAction();
    if (res.success && res.data) setNotifications(res.data);
  };

  const handleNotificationClick = async (id: string) => {
    const notification = notifications.find((n) => n._id === id);
    if (!notification || notification.readAt) return;

    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, readAt: new Date() } : n))
    );
    await markNotificationReadAction(id);
    router.refresh();
  };

  const handleMarkAllAsRead = async () => {
    const unreadList = notifications.filter((n) => !n.readAt);
    if (unreadList.length === 0) return;
    await Promise.all(unreadList.map((n) => markNotificationReadAction(n._id as string)));
    setNotifications((prev) => prev.map((n) => ({ ...n, readAt: n.readAt || new Date() })));
    toast.success("All notifications marked as read");
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    const res = await deleteNotificationAction(id);
    if (res.success) {
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      toast.success("Notification deleted");
      router.refresh();
    } else {
      toast.error("Failed to delete notification");
    }
  };

  const handleCompleteReminder = async (notificationId: string, reminderId: string) => {
    const res = await completeReminderAction(reminderId);
    if (res.success) {
      // Also mark the notification as read
      await markNotificationReadAction(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, readAt: new Date() } : n))
      );
      toast.success("Reminder marked as complete");
      router.refresh();
    } else {
      toast.error("Failed to complete reminder");
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
        <ItemGroup>
          {list.map((n) => {
            const isReminder = n.type === "reminder.due";
            const hasLink = !!n.link;

            return (
              <Item
                key={n._id as string}
                variant={!n.readAt ? "muted" : "outline"}
                className="items-start md:items-center justify-between cursor-pointer"
                asChild={hasLink}
                onClick={!hasLink ? () => handleNotificationClick(n._id as string) : undefined}
              >
                {hasLink ? (
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
                      // already read → navigate naturally
                    }}
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
                  </Link>
                ) : (
                  <div
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && handleNotificationClick(n._id as string)}
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

                    <ItemActions className="self-end md:self-center shrink-0 mt-3 md:mt-0 ml-auto" />
                  </div>
                )}
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
