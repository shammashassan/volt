# Personal Knowledge OS UI Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the user interfaces for Reminders (checklists, quick-capture parsing, priority sorting) and Notifications (header popover bell with GSAP animations, Linear-like notification center).

**Architecture:** UI components fetch data and trigger state updates using Next.js Server Actions scoped within modular feature folders (`features/reminders/actions`, `features/notifications/actions`). Header state uses client-side pooling refreshed via TanStack-like polling, while GSAP triggers ring micro-animations on the notification bell.

**Tech Stack:** Next.js (App Router), React, Lucide-React, GSAP, Radix UI.

---

### Task 1: Server Actions for Reminders

**Files:**
- Create: [features/reminders/actions/reminders.ts](file:///c:/Users/ADMIN/Desktop/shammas/website/volt/features/reminders/actions/reminders.ts)

- [ ] **Step 1: Implement reminders server actions**

Create `features/reminders/actions/reminders.ts`:
```typescript
"use server";

import { ReminderRepository } from '../repositories/reminder.repository';
import { Reminder, ReminderStatus, ReminderPriority, ReminderAttachment } from '../schemas/reminder';
import { getSessionUser, getErrorMessage } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';
import { parseReminderText } from '@/lib/utils/parser';

const repo = new ReminderRepository();

export async function getRemindersAction() {
  try {
    const user = await getSessionUser();
    const db = await repo.getCollection();
    const items = await db.find({
      userId: user.id,
      deletedAt: { $exists: false }
    }).sort({ status: 1, triggerAt: 1, sortOrder: 1 }).toArray();

    return { success: true, data: JSON.parse(JSON.stringify(items)) as Reminder[] };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

export async function createReminderAction(payload: {
  title: string;
  description?: string;
  triggerAt: Date;
  priority: ReminderPriority;
  attachments?: ReminderAttachment[];
}) {
  try {
    const user = await getSessionUser();
    const reminder = await repo.create({
      userId: user.id,
      title: payload.title,
      description: payload.description,
      status: 'pending',
      priority: payload.priority,
      triggerAt: new Date(payload.triggerAt),
      attachments: payload.attachments || [],
      notification: {}
    });

    revalidatePath('/reminders');
    return { success: true, data: JSON.parse(JSON.stringify(reminder)) as Reminder };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

export async function createReminderFromTextAction(text: string, priority: ReminderPriority) {
  try {
    const user = await getSessionUser();
    const parsed = parseReminderText(text);
    const triggerAt = parsed.triggerAt || new Date(Date.now() + 24 * 60 * 60 * 1000); // Default to tomorrow

    const reminder = await repo.create({
      userId: user.id,
      title: parsed.title,
      status: 'pending',
      priority,
      triggerAt,
      attachments: [],
      notification: {}
    });

    revalidatePath('/reminders');
    return { success: true, data: JSON.parse(JSON.stringify(reminder)) as Reminder };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

export async function updateReminderAction(id: string, updates: Partial<Reminder>) {
  try {
    const user = await getSessionUser();
    const reminder = await repo.update(id, user.id, {
      ...updates,
      ...(updates.triggerAt ? { triggerAt: new Date(updates.triggerAt) } : {})
    });

    revalidatePath('/reminders');
    return { success: true, data: JSON.parse(JSON.stringify(reminder)) as Reminder };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

export async function deleteReminderAction(id: string) {
  try {
    const user = await getSessionUser();
    const success = await repo.softDelete(id, user.id);

    revalidatePath('/reminders');
    return { success: true, data: success };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}
```

- [ ] **Step 2: Verify code compiles**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add features/reminders/actions/reminders.ts
git commit -m "feat: add server actions for Reminder CRUD operations"
```

---

### Task 2: Server Actions for Notifications

**Files:**
- Create: [features/notifications/actions/notifications.ts](file:///c:/Users/ADMIN/Desktop/shammas/website/volt/features/notifications/actions/notifications.ts)

- [ ] **Step 1: Implement notifications server actions**

Create `features/notifications/actions/notifications.ts`:
```typescript
"use server";

import { NotificationRepository } from '../repositories/notification.repository';
import { Notification } from '../schemas/notification';
import { getSessionUser, getErrorMessage } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';

const repo = new NotificationRepository();

export async function getNotificationsAction() {
  try {
    const user = await getSessionUser();
    const db = await repo.getCollection();
    const items = await db.find({
      userId: user.id,
      deletedAt: { $exists: false }
    }).sort({ createdAt: -1 }).toArray();

    return { success: true, data: JSON.parse(JSON.stringify(items)) as Notification[] };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

export async function markNotificationReadAction(id: string) {
  try {
    const user = await getSessionUser();
    const success = await repo.markRead(id, user.id);

    revalidatePath('/notifications');
    return { success: true, data: success };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

export async function archiveNotificationAction(id: string) {
  try {
    const user = await getSessionUser();
    const success = await repo.archive(id, user.id);

    revalidatePath('/notifications');
    return { success: true, data: success };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

export async function deleteNotificationAction(id: string) {
  try {
    const user = await getSessionUser();
    const success = await repo.softDelete(id, user.id);

    revalidatePath('/notifications');
    return { success: true, data: success };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}
```

- [ ] **Step 2: Verify code compiles**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add features/notifications/actions/notifications.ts
git commit -m "feat: add server actions for Notification state management"
```

---

### Task 3: Header Notifications Bell Dropdown

**Files:**
- Create: [components/header-bell.tsx](file:///c:/Users/ADMIN/Desktop/shammas/website/volt/components/header-bell.tsx)
- Modify: [components/site-header.tsx](file:///c:/Users/ADMIN/Desktop/shammas/website/volt/components/site-header.tsx)

- [ ] **Step 1: Create HeaderBell component with GSAP animations**

Create `components/header-bell.tsx`:
```typescript
"use client";

import { useEffect, useState, useRef } from 'react';
import { Bell, Check, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Notification } from '@/features/notifications/schemas/notification';
import { getNotificationsAction, markNotificationReadAction, deleteNotificationAction } from '@/features/notifications/actions/notifications';
import { toast } from 'sonner';
import Link from 'next/link';
import gsap from 'gsap';

export function HeaderBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const bellRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);

  const unreadCount = notifications.filter(n => !n.readAt && !n.dismissedAt).length;

  const fetchNotifications = async () => {
    const res = await getNotificationsAction();
    if (res.success && res.data) {
      setNotifications(res.data);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Polling every 60s
    return () => clearInterval(interval);
  }, []);

  // Trigger GSAP ring animation when new unread notifications arrive
  useEffect(() => {
    if (unreadCount > 0 && bellRef.current) {
      const tl = gsap.timeline();
      tl.to(bellRef.current, { rotation: 15, duration: 0.1, yoyo: true, repeat: 5 })
        .to(bellRef.current, { rotation: -15, duration: 0.1, yoyo: true, repeat: 5 }, "<")
        .to(bellRef.current, { rotation: 0, duration: 0.1 });
    }
  }, [unreadCount]);

  const handleMarkRead = async (id: string) => {
    const res = await markNotificationReadAction(id);
    if (res.success) {
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, readAt: new Date() } : n));
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

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          ref={bellRef}
          variant="ghost"
          size="icon"
          className="relative rounded-full hover:bg-accent hover:text-accent-foreground"
        >
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span ref={triggerRef} className="absolute top-1.5 right-1.5 flex size-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
              <span className="relative inline-flex rounded-full size-2.5 bg-destructive"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-2">
          <span className="font-semibold text-sm">Notifications ({unreadCount} unread)</span>
          <Link href="/notifications" className="text-xs text-primary hover:underline">
            View All
          </Link>
        </div>
        <ScrollArea className="h-64">
          {notifications.length === 0 ? (
            <div className="flex items-center justify-center h-full py-8 text-muted-foreground text-xs">
              No notifications yet.
            </div>
          ) : (
            <div className="divide-y">
              {notifications.slice(0, 5).map(n => (
                <div
                  key={n._id as string}
                  className={`p-3 text-xs transition-colors hover:bg-muted/50 ${!n.readAt ? 'bg-muted/30 font-medium' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-foreground">{n.title}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="mt-1 text-muted-foreground text-[11px] leading-normal">{n.message}</p>
                  <div className="flex items-center justify-end gap-1.5 mt-2">
                    {n.link && (
                      <Button asChild size="icon" variant="ghost" className="size-6">
                        <Link href={n.link}>
                          <ExternalLink className="size-3.5" />
                        </Link>
                      </Button>
                    )}
                    {!n.readAt && (
                      <Button onClick={() => handleMarkRead(n._id as string)} size="icon" variant="ghost" className="size-6 text-emerald-600">
                        <Check className="size-3.5" />
                      </Button>
                    )}
                    <Button onClick={() => handleDelete(n._id as string)} size="icon" variant="ghost" className="size-6 text-destructive">
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
```

- [ ] **Step 2: Add HeaderBell to SiteHeader**

Modify `components/site-header.tsx` to import and render `HeaderBell` next to `ModeToggle`:
```typescript
// Import:
import { HeaderBell } from "@/components/header-bell"

// Modify render around lines 87-91:
        <div className="flex items-center gap-2 sm:gap-4">
          <SearchCommand />
          <HeaderBell />
          <ModeToggle />
        </div>
```

- [ ] **Step 3: Verify code compiles**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add components/header-bell.tsx components/site-header.tsx
git commit -m "feat: add notification bell dropdown into dashboard header with GSAP animations"
```

---

### Task 4: Notifications Center Page (`/notifications`)

**Files:**
- Create: [app/(dashboard)/notifications/page.tsx](file:///c:/Users/ADMIN/Desktop/shammas/website/volt/app/(dashboard)/notifications/page.tsx)
- Create: [app/(dashboard)/notifications/notifications-content.tsx](file:///c:/Users/ADMIN/Desktop/shammas/website/volt/app/(dashboard)/notifications/notifications-content.tsx)

- [ ] **Step 1: Create notifications page routing**

Create `app/(dashboard)/notifications/page.tsx`:
```typescript
import { getNotificationsAction } from '@/features/notifications/actions/notifications';
import { NotificationsContent } from './notifications-content';

export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
  const result = await getNotificationsAction();
  const initialNotifications = result.success && result.data ? result.data : [];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
      </div>
      <NotificationsContent initialNotifications={initialNotifications} />
    </div>
  );
}
```

- [ ] **Step 2: Create notifications content view**

Create `app/(dashboard)/notifications/notifications-content.tsx`:
```typescript
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
```

- [ ] **Step 3: Verify code compiles**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add app/\(dashboard\)/notifications/page.tsx app/\(dashboard\)/notifications/notifications-content.tsx
git commit -m "feat: implement notification center page grouped chronologically"
```

---

### Task 5: Reminders Page UI & Today Timeline

**Files:**
- Create: [app/(dashboard)/reminders/page.tsx](file:///c:/Users/ADMIN/Desktop/shammas/website/volt/app/(dashboard)/reminders/page.tsx)
- Create: [app/(dashboard)/reminders/reminders-content.tsx](file:///c:/Users/ADMIN/Desktop/shammas/website/volt/app/(dashboard)/reminders/reminders-content.tsx)

- [ ] **Step 1: Create reminders page routing**

Create `app/(dashboard)/reminders/page.tsx`:
```typescript
import { getRemindersAction } from '@/features/reminders/actions/reminders';
import { RemindersContent } from './reminders-content';

export const dynamic = 'force-dynamic';

export default async function RemindersPage() {
  const result = await getRemindersAction();
  const initialReminders = result.success && result.data ? result.data : [];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Reminders</h2>
      </div>
      <RemindersContent initialReminders={initialReminders} />
    </div>
  );
}
```

- [ ] **Step 2: Create reminders content view (Checklists & Timeline)**

Create `app/(dashboard)/reminders/reminders-content.tsx`:
```typescript
"use client";

import { useState } from 'react';
import { Reminder, ReminderPriority, ReminderStatus } from '@/features/reminders/schemas/reminder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createReminderFromTextAction, updateReminderAction, deleteReminderAction } from '@/features/reminders/actions/reminders';
import { Plus, Trash2, Calendar, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface RemindersContentProps {
  initialReminders: Reminder[];
}

export function RemindersContent({ initialReminders }: RemindersContentProps) {
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders);
  const [inputText, setInputText] = useState('');
  const [priority, setPriority] = useState<ReminderPriority>('P3');

  const pending = reminders.filter(r => r.status === 'pending');
  const completed = reminders.filter(r => r.status === 'completed');

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const res = await createReminderFromTextAction(inputText, priority);
    if (res.success && res.data) {
      setReminders(prev => [res.data!, ...prev].sort((a, b) => a.status.localeCompare(b.status)));
      setInputText('');
      toast.success('Reminder added');
    } else {
      toast.error('Failed to add reminder');
    }
  };

  const handleStatusChange = async (id: string, completedStatus: boolean) => {
    const nextStatus: ReminderStatus = completedStatus ? 'completed' : 'pending';
    const res = await updateReminderAction(id, { status: nextStatus });
    if (res.success && res.data) {
      setReminders(prev => prev.map(r => r._id === id ? res.data! : r));
      toast.success(completedStatus ? 'Reminder completed' : 'Reminder pending');
    } else {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    const res = await deleteReminderAction(id);
    if (res.success) {
      setReminders(prev => prev.filter(r => r._id !== id));
      toast.success('Reminder deleted');
    } else {
      toast.error('Failed to delete reminder');
    }
  };

  const getPriorityColor = (p: ReminderPriority) => {
    switch (p) {
      case 'P1': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'P2': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'P3': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  // Generate Today Timeline
  const getTimelineItems = () => {
    const todayStr = new Date().toDateString();
    return reminders
      .filter(r => new Date(r.triggerAt).toDateString() === todayStr)
      .sort((a, b) => new Date(a.triggerAt).getTime() - new Date(b.triggerAt).getTime());
  };

  const timelineItems = getTimelineItems();

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* List Column */}
      <div className="md:col-span-2 space-y-4">
        {/* Quick Add Capture */}
        <form onSubmit={handleQuickAdd} className="flex gap-2">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder='Add a reminder (e.g. "Meeting tomorrow at 3pm")'
            className="flex-1"
          />
          <Select value={priority} onValueChange={(v) => setPriority(v as ReminderPriority)}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="P1">P1 (High)</SelectItem>
              <SelectItem value="P2">P2 (Medium)</SelectItem>
              <SelectItem value="P3">P3 (Normal)</SelectItem>
              <SelectItem value="P4">P4 (Low)</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit">
            <Plus className="size-4 mr-2" />
            Add
          </Button>
        </form>

        {/* Pending checklist */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pending.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No tasks to do.</p>
            ) : (
              pending.map(r => (
                <div key={r._id as string} className="flex items-center justify-between border-b pb-2 gap-3">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={false}
                      onCheckedChange={(checked) => handleStatusChange(r._id as string, !!checked)}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{r.title}</span>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="size-3" />
                        {new Date(r.triggerAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getPriorityColor(r.priority)}>
                      {r.priority}
                    </Badge>
                    <Button onClick={() => handleDelete(r._id as string)} variant="ghost" size="icon" className="size-8 text-destructive">
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Completed checklist */}
        {completed.length > 0 && (
          <Card className="opacity-70">
            <CardHeader>
              <CardTitle className="text-lg">Completed</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {completed.map(r => (
                <div key={r._id as string} className="flex items-center justify-between border-b pb-2 gap-3">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={true}
                      onCheckedChange={(checked) => handleStatusChange(r._id as string, !!checked)}
                    />
                    <span className="text-sm line-through text-muted-foreground">{r.title}</span>
                  </div>
                  <Button onClick={() => handleDelete(r._id as string)} variant="ghost" size="icon" className="size-8 text-destructive">
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Timeline Sidebar Column */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="size-5 text-primary" />
              Today's Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            {timelineItems.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No activities scheduled for today.</p>
            ) : (
              <div className="relative border-l pl-4 ml-2 space-y-4">
                {timelineItems.map((r, idx) => (
                  <div key={r._id as string} className="relative">
                    {/* Circle Node */}
                    <div className={`absolute -left-[21px] mt-1 size-3 rounded-full border bg-background ${r.status === 'completed' ? 'border-emerald-500 bg-emerald-500' : 'border-primary'}`}></div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-semibold text-muted-foreground">
                        {new Date(r.triggerAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className={`text-xs font-medium mt-0.5 ${r.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {r.title}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Add Reminders to Sidebar navigation**

Modify `components/app-sidebar.tsx` around lines 112-119:
```typescript
    {
      title: "Workspace",
      url: "/projects",
      icon: FolderOpen,
      isActive: ["/projects", "/notes", "/reminders"].includes(pathname),
      items: [
        { title: "Projects", url: "/projects", isActive: pathname === "/projects" },
        { title: "Notes", url: "/notes", isActive: pathname === "/notes" },
        { title: "Reminders", url: "/reminders", isActive: pathname === "/reminders" },
      ],
    },
```

- [ ] **Step 4: Verify code compiles**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/\(dashboard\)/reminders/page.tsx app/\(dashboard\)/reminders/reminders-content.tsx components/app-sidebar.tsx
git commit -m "feat: implement reminders checklist and today timeline dashboard"
```
