"use client";

import * as React from "react";
import { useState, useMemo, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Bell,
  Clock,
  Film,
  Tv,
  ChevronRight,
  CheckCheck,
  Search,
  X,
  Filter,
  MoreVertical,
  Trash2,
  MailCheck,
} from "lucide-react";
import { completeReminderAction } from "@/lib/actions/reminders";
import { useNotifications } from "@/components/notifications/notifications-provider";
import { toast } from "@/components/ui/toast";
import Link from "next/link";
import { useQueryState } from "nuqs";

interface NotificationsContentProps {
  initialNotifications?: Notification[];
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  "reminder.due": <Clock className="size-4" />,
  "watchlist.release": <Film className="size-4" />,
  "watchlist.episode": <Tv className="size-4" />,
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
        {TYPE_ICON[type] ?? <Bell className="size-4" />}
      </div>
    </ItemMedia>
  );
}

export function NotificationsContent({
  initialNotifications,
}: NotificationsContentProps) {
  const {
    notifications: contextNotifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearRead,
    clearAll,
  } = useNotifications();

  // URL state filters (Nuqs)
  const [statusFilter, setStatusFilter] = useQueryState("status", {
    defaultValue: "all",
  });
  const [typeFilter, setTypeFilter] = useQueryState("type", {
    defaultValue: "all",
  });
  const [q, setQ] = useQueryState("q", { defaultValue: "" });

  const currentQ = q ?? "";
  const [searchValue, setSearchValue] = useState(currentQ);

  // Debounce search update to URL
  useEffect(() => {
    const handler = setTimeout(() => {
      setQ(searchValue || null);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchValue, setQ]);

  // Sync external URL changes
  useEffect(() => {
    setSearchValue(currentQ);
  }, [currentQ]);

  // Dialog state
  const [isClearReadOpen, setIsClearReadOpen] = useState(false);
  const [isClearAllOpen, setIsClearAllOpen] = useState(false);

  // Fallback to initialNotifications from SSR before provider hydrates
  const [hasSynced, setHasSynced] = useState(false);
  useEffect(() => {
    if (contextNotifications.length > 0) {
      setHasSynced(true);
    }
  }, [contextNotifications]);

  const allNotifications =
    hasSynced || contextNotifications.length > 0
      ? contextNotifications
      : initialNotifications || [];

  const unreadItems = useMemo(
    () => allNotifications.filter((n) => !n.readAt),
    [allNotifications]
  );
  const readItems = useMemo(
    () => allNotifications.filter((n) => !!n.readAt),
    [allNotifications]
  );

  // Filtered list
  const filteredNotifications = useMemo(() => {
    return allNotifications.filter((n) => {
      // 1. Status Filter
      if (statusFilter === "unread" && n.readAt) return false;
      if (statusFilter === "read" && !n.readAt) return false;

      // 2. Type Filter
      if (typeFilter === "reminders" && n.type !== "reminder.due") return false;
      if (
        typeFilter === "watchlist" &&
        n.type !== "watchlist.release" &&
        n.type !== "watchlist.episode"
      )
        return false;
      if (
        typeFilter === "system" &&
        (n.type === "reminder.due" ||
          n.type === "watchlist.release" ||
          n.type === "watchlist.episode")
      )
        return false;

      // 3. Search query
      if (currentQ.trim()) {
        const query = currentQ.toLowerCase();
        const matchesTitle = n.title.toLowerCase().includes(query);
        const matchesMessage = n.message.toLowerCase().includes(query);
        if (!matchesTitle && !matchesMessage) return false;
      }

      return true;
    });
  }, [allNotifications, statusFilter, typeFilter, currentQ]);

  // Group notifications by date
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

  const { today, yesterday, older } = groupNotifications(filteredNotifications);

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

  const handleCompleteReminder = async (
    notificationId: string,
    reminderId: string
  ) => {
    const promise = completeReminderAction(reminderId).then(async (res) => {
      if (!res.success) {
        throw new Error(res.error || "Failed to complete reminder");
      }
      await markAsRead(notificationId);
      return res;
    });

    toast.promise(promise, {
      loading: "Completing reminder...",
      success: "Reminder marked as complete",
      error: (err: any) => err?.message || "Failed to complete reminder",
    });
  };

  const handleClearRead = async () => {
    const promise = clearRead();
    toast.promise(promise, {
      loading: "Clearing read notifications...",
      success: "Read notifications cleared",
      error: "Failed to clear notifications",
    });
  };

  const handleClearAll = async () => {
    const promise = clearAll();
    toast.promise(promise, {
      loading: "Clearing all notifications...",
      success: "All notifications cleared",
      error: "Failed to clear notifications",
    });
  };

  const resetFilters = () => {
    setStatusFilter(null);
    setTypeFilter(null);
    setSearchValue("");
    setQ(null);
  };

  const hasActiveFilters =
    statusFilter !== "all" || typeFilter !== "all" || !!currentQ.trim();

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
                      onClick={() => {
                        if (!n.readAt) {
                          if (isReminder && n.reminderId) {
                            handleCompleteReminder(
                              n._id as string,
                              n.reminderId
                            );
                          } else {
                            handleNotificationClick(n._id as string);
                          }
                        }
                      }}
                    />
                  ) : undefined
                }
                onClick={
                  !hasLink
                    ? () => handleNotificationClick(n._id as string)
                    : undefined
                }
                role={!hasLink ? "button" : undefined}
                tabIndex={!hasLink ? 0 : undefined}
                onKeyDown={
                  !hasLink
                    ? (e) =>
                        e.key === "Enter" &&
                        handleNotificationClick(n._id as string)
                    : undefined
                }
              >
                <NotificationIcon
                  type={n.type}
                  image={n.image}
                  title={n.title}
                />

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
                  {hasLink && <ChevronRight className="size-4" />}
                </ItemActions>
              </Item>
            );
          })}
        </ItemGroup>
      </div>
    );
  };

  return (
    <div className="flex flex-1 flex-col gap-6 pb-12 w-full min-w-0">
      {/* Header Section */}
      <section className="px-4 pt-8 lg:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between max-w-7xl">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Bell className="size-6" />
              </div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-black tracking-tight md:text-4xl bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/60">
                  Notifications
                </h1>
                <Badge
                  variant="outline"
                  className="h-6 rounded-full border-primary/20 bg-primary/5 text-primary text-[10px] uppercase font-bold tracking-widest px-2.5"
                >
                  {unreadCount} Unread
                </Badge>
              </div>
            </div>
            <p className="text-lg text-muted-foreground/80 max-w-2xl font-medium">
              View and manage your alerts, reminders, and activities.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              onClick={handleMarkAllAsRead}
              variant="outline"
              size="sm"
              className="w-full sm:w-auto gap-2"
              disabled={unreadCount === 0}
            >
              <CheckCheck className="size-3.5" />
              <span>Mark all as read</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8 shrink-0"
                    disabled={allNotifications.length === 0}
                  />
                }
              >
                <MoreVertical className="size-4" />
                <span className="sr-only">Notification options</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => setIsClearReadOpen(true)}
                  disabled={readItems.length === 0}
                  className="gap-2 whitespace-nowrap"
                >
                  <MailCheck className="size-4 shrink-0" />
                  <span className="flex-1">Clear read</span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    ({readItems.length})
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setIsClearAllOpen(true)}
                  disabled={allNotifications.length === 0}
                  className="gap-2 text-destructive focus:text-destructive whitespace-nowrap"
                >
                  <Trash2 className="size-4 shrink-0" />
                  <span>Clear all</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </section>

      {/* Filter and Search Controls */}
      <section className="px-4 lg:px-6">
        <div className="max-w-7xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Status Tabs Navigation */}
          <Tabs
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val as string)}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid grid-cols-3 w-full sm:w-auto min-w-[280px]">
              <TabsTrigger
                value="all"
                className="text-xs font-semibold gap-1.5"
              >
                All
                <Badge
                  variant="secondary"
                  size="xs"
                  className="rounded-full px-1.5 min-w-4 font-bold"
                >
                  {allNotifications.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="unread"
                className="text-xs font-semibold gap-1.5"
              >
                Unread
                <Badge
                  variant="secondary"
                  size="xs"
                  className="rounded-full px-1.5 min-w-4 font-bold"
                >
                  {unreadCount}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="read"
                className="text-xs font-semibold gap-1.5"
              >
                Read
                <Badge
                  variant="secondary"
                  size="xs"
                  className="rounded-full px-1.5 min-w-4 font-bold"
                >
                  {readItems.length}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Filter and Search Bar */}
          <div className="flex items-center gap-2 flex-1 sm:max-w-md ml-auto">
            {/* Search Box */}
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search notifications..."
                className="pl-9 pr-8 h-8 text-xs font-medium"
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchValue("");
                    setQ(null);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                  <span className="sr-only">Clear search</span>
                </button>
              )}
            </div>

            {/* Type Category Filter */}
            <Select
              value={typeFilter}
              onValueChange={(val) => setTypeFilter(val as string)}
            >
              <SelectTrigger className="w-[130px] h-8 text-xs font-medium shrink-0">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="reminders">Reminders</SelectItem>
                <SelectItem value="watchlist">Watchlist</SelectItem>
                <SelectItem value="system">System Alerts</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="px-4 lg:px-6">
        <div className="max-w-7xl">
          {allNotifications.length === 0 ? (
            <Empty className="py-20 border border-dashed rounded-2xl bg-card/10">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Bell className="size-5" />
                </EmptyMedia>
                <EmptyTitle>You&apos;re all caught up</EmptyTitle>
                <EmptyDescription>
                  You don&apos;t have any notifications right now. New
                  reminders, releases, and alerts will appear here.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : filteredNotifications.length === 0 ? (
            <Empty className="py-16 border border-dashed rounded-2xl bg-card/10">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Filter className="size-5" />
                </EmptyMedia>
                <EmptyTitle>No notifications match your filters</EmptyTitle>
                <EmptyDescription>
                  Try adjusting your search query or selecting a different
                  filter category.
                </EmptyDescription>
              </EmptyHeader>
              {hasActiveFilters && (
                <EmptyContent>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetFilters}
                    className="font-medium"
                  >
                    Reset all filters
                  </Button>
                </EmptyContent>
              )}
            </Empty>
          ) : (
            <div className="flex flex-col gap-8">
              {renderSection("Today", today)}
              {renderSection("Yesterday", yesterday)}
              {renderSection("Earlier", older)}
            </div>
          )}
        </div>
      </section>

      {/* Clear Read Confirmation */}
      <AlertDialog open={isClearReadOpen} onOpenChange={setIsClearReadOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <Trash2 />
            </AlertDialogMedia>
            <AlertDialogTitle>Clear read notifications?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all {readItems.length} read notifications from
              your feed. Unread notifications will remain.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                setIsClearReadOpen(false);
                handleClearRead();
              }}
            >
              Clear Read
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear All Confirmation */}
      <AlertDialog open={isClearAllOpen} onOpenChange={setIsClearAllOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <Trash2 />
            </AlertDialogMedia>
            <AlertDialogTitle>Clear all notifications?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all {allNotifications.length} notifications from
              your feed, including unread items.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                setIsClearAllOpen(false);
                handleClearAll();
              }}
            >
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
