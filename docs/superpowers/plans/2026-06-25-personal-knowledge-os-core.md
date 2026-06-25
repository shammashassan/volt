# Personal Knowledge OS Core Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the foundational Domain, Persistence, and Automation layers for Volt's Planning and Automation capability, including Event Bus, Repositories, Services, and Priority Scheduler.

**Architecture:** We decouple business logic from Next.js endpoints and MongoDB drivers by introducing an in-memory Event Bus for domain events, a Repository layer for data persistence, and priority-driven registered scheduler jobs. Shared base models establish standard soft-deletes and type-safe IDs across all feature modules.

**Tech Stack:** Next.js (App Router), TypeScript, MongoDB, Chrono-Node.

---

### Task 1: Standard Base Types & Base Document interface

**Files:**
- Create: [features/shared/types.ts](file:///c:/Users/ADMIN/Desktop/shammas/website/volt/features/shared/types.ts)

- [ ] **Step 1: Implement core base interfaces**

Create `features/shared/types.ts`:
```typescript
import { ObjectId } from 'mongodb';

export type UserId = string;
export type ReminderId = string;
export type NotificationId = string;
export type NoteId = string;
export type ProjectId = string;
export type ResourceId = string;
export type PersonId = string;
export type WatchlistId = string;

export interface BaseDocument {
  _id?: string | ObjectId;
  userId: UserId;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
```

- [ ] **Step 2: Commit**

```bash
git add features/shared/types.ts
git commit -m "feat: add standard base types and base document interface"
```

---

### Task 2: In-Memory Event Bus

**Files:**
- Create: [features/shared/event-bus.ts](file:///c:/Users/ADMIN/Desktop/shammas/website/volt/features/shared/event-bus.ts)

- [ ] **Step 1: Implement EventBus singleton**

Create `features/shared/event-bus.ts`:
```typescript
export type EventCallback = (payload: any) => void | Promise<void>;

export class EventBus {
  private static instance: EventBus;
  private listeners: Map<string, EventCallback[]> = new Map();

  private constructor() {}

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  public subscribe(eventType: string, callback: EventCallback): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(callback);
  }

  public publish(eventType: string, payload: any): void {
    const handlers = this.listeners.get(eventType) || [];
    for (const handler of handlers) {
      try {
        const result = handler(payload);
        if (result instanceof Promise) {
          result.catch(err => console.error(`Error in async event handler for ${eventType}:`, err));
        }
      } catch (err) {
        console.error(`Error in event handler for ${eventType}:`, err);
      }
    }
  }

  public clearAll(): void {
    this.listeners.clear();
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add features/shared/event-bus.ts
git commit -m "feat: implement in-memory Event Bus singleton"
```

---

### Task 3: Domain Models & Repositories (Reminders, Notifications)

**Files:**
- Create: [features/reminders/schemas/reminder.ts](file:///c:/Users/ADMIN/Desktop/shammas/website/volt/features/reminders/schemas/reminder.ts)
- Create: [features/reminders/repositories/reminder.repository.ts](file:///c:/Users/ADMIN/Desktop/shammas/website/volt/features/reminders/repositories/reminder.repository.ts)
- Create: [features/notifications/schemas/notification.ts](file:///c:/Users/ADMIN/Desktop/shammas/website/volt/features/notifications/schemas/notification.ts)
- Create: [features/notifications/repositories/notification.repository.ts](file:///c:/Users/ADMIN/Desktop/shammas/website/volt/features/notifications/repositories/notification.repository.ts)

- [ ] **Step 1: Write Reminder schema definition**

Create `features/reminders/schemas/reminder.ts`:
```typescript
import { BaseDocument } from '@/features/shared/types';

export type ReminderPriority = 'P1' | 'P2' | 'P3' | 'P4';
export type ReminderStatus = 'pending' | 'completed' | 'cancelled' | 'expired';

export interface ReminderAttachment {
  type: 'note' | 'project' | 'person' | 'resource' | 'watchlist';
  id: string;
}

export interface Reminder extends BaseDocument {
  title: string;
  description?: string;
  status: ReminderStatus;
  priority: ReminderPriority;
  triggerAt: Date;
  sortOrder?: number;
  attachments: ReminderAttachment[];
  
  notification: {
    lastNotifiedAt?: Date;
    sentAt?: Date;
  };
  
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'none';
    interval?: number;
  };
}
```

- [ ] **Step 2: Implement MongoDB Reminder Repository**

Create `features/reminders/repositories/reminder.repository.ts`:
```typescript
import { getDb } from '@/lib/db';
import { Reminder } from '../schemas/reminder';
import { ObjectId } from 'mongodb';
import { UserId } from '@/features/shared/types';

export class ReminderRepository {
  private async getCollection() {
    const db = await getDb();
    return db.collection<Reminder>('reminders');
  }

  async findById(id: string, userId: UserId): Promise<Reminder | null> {
    const col = await this.getCollection();
    const query = ObjectId.isValid(id) ? { _id: new ObjectId(id), userId } : { id, userId };
    return col.findOne({ ...query, deletedAt: { $exists: false } }) as Promise<Reminder | null>;
  }

  async findDue(now: Date): Promise<Reminder[]> {
    const col = await this.getCollection();
    return col.find({
      status: 'pending',
      triggerAt: { $lte: now },
      deletedAt: { $exists: false }
    }).toArray() as Promise<Reminder[]>;
  }

  async create(reminder: Omit<Reminder, 'createdAt' | 'updatedAt'>): Promise<Reminder> {
    const col = await this.getCollection();
    const doc: Reminder = {
      ...reminder,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const res = await col.insertOne(doc as any);
    return { ...doc, _id: res.insertedId };
  }

  async update(id: string, userId: UserId, updates: Partial<Reminder>): Promise<Reminder | null> {
    const col = await this.getCollection();
    const query = ObjectId.isValid(id) ? { _id: new ObjectId(id), userId } : { id, userId };
    const res = await col.findOneAndUpdate(
      { ...query, deletedAt: { $exists: false } },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    return res as unknown as Reminder | null;
  }

  async softDelete(id: string, userId: UserId): Promise<boolean> {
    const col = await this.getCollection();
    const query = ObjectId.isValid(id) ? { _id: new ObjectId(id), userId } : { id, userId };
    const res = await col.updateOne(
      query,
      { $set: { deletedAt: new Date(), updatedAt: new Date() } }
    );
    return res.modifiedCount > 0;
  }

  async hardDeleteExpired(olderThan: Date): Promise<number> {
    const col = await this.getCollection();
    const res = await col.deleteMany({
      deletedAt: { $lte: olderThan }
    });
    return res.deletedCount;
  }
}
```

- [ ] **Step 3: Write Notification schema definition**

Create `features/notifications/schemas/notification.ts`:
```typescript
import { BaseDocument } from '@/features/shared/types';

export const NotificationTypes = {
  WATCHLIST_RELEASE: 'watchlist.release',
  WATCHLIST_EPISODE: 'watchlist.episode',
  REMINDER_DUE: 'reminder.due',
  PROJECT_DEADLINE: 'project.deadline',
  SYSTEM: 'system',
} as const;

export type NotificationType = typeof NotificationTypes[keyof typeof NotificationTypes];

export interface Notification extends BaseDocument {
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  readAt?: Date;
  dismissedAt?: Date;
  archivedAt?: Date;
}
```

- [ ] **Step 4: Implement MongoDB Notification Repository**

Create `features/notifications/repositories/notification.repository.ts`:
```typescript
import { getDb } from '@/lib/db';
import { Notification } from '../schemas/notification';
import { ObjectId } from 'mongodb';
import { UserId } from '@/features/shared/types';

export class NotificationRepository {
  private async getCollection() {
    const db = await getDb();
    return db.collection<Notification>('notifications');
  }

  async findUnread(userId: UserId): Promise<Notification[]> {
    const col = await this.getCollection();
    return col.find({
      userId,
      readAt: { $exists: false },
      dismissedAt: { $exists: false },
      deletedAt: { $exists: false }
    }).sort({ createdAt: -1 }).toArray() as Promise<Notification[]>;
  }

  async create(notification: Omit<Notification, 'createdAt' | 'updatedAt'>): Promise<Notification> {
    const col = await this.getCollection();
    const doc: Notification = {
      ...notification,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const res = await col.insertOne(doc as any);
    return { ...doc, _id: res.insertedId };
  }

  async markRead(id: string, userId: UserId): Promise<boolean> {
    const col = await this.getCollection();
    const query = ObjectId.isValid(id) ? { _id: new ObjectId(id), userId } : { id, userId };
    const res = await col.updateOne(
      query,
      { $set: { readAt: new Date(), updatedAt: new Date() } }
    );
    return res.modifiedCount > 0;
  }

  async archive(id: string, userId: UserId): Promise<boolean> {
    const col = await this.getCollection();
    const query = ObjectId.isValid(id) ? { _id: new ObjectId(id), userId } : { id, userId };
    const res = await col.updateOne(
      query,
      { $set: { archivedAt: new Date(), updatedAt: new Date() } }
    );
    return res.modifiedCount > 0;
  }

  async softDelete(id: string, userId: UserId): Promise<boolean> {
    const col = await this.getCollection();
    const query = ObjectId.isValid(id) ? { _id: new ObjectId(id), userId } : { id, userId };
    const res = await col.updateOne(
      query,
      { $set: { deletedAt: new Date(), updatedAt: new Date() } }
    );
    return res.modifiedCount > 0;
  }

  async hardDeleteExpired(olderThan: Date): Promise<number> {
    const col = await this.getCollection();
    const res = await col.deleteMany({
      $or: [
        { deletedAt: { $lte: olderThan } },
        { createdAt: { $lte: olderThan } } // 90 days retention limits
      ]
    });
    return res.deletedCount;
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add features/reminders/schemas/reminder.ts features/reminders/repositories/reminder.repository.ts features/notifications/schemas/notification.ts features/notifications/repositories/notification.repository.ts
git commit -m "feat: add reminder & notification schemas and repositories"
```

---

### Task 4: Domain Services (ReminderService, NotificationService)

**Files:**
- Create: [features/notifications/services/notification.service.ts](file:///c:/Users/ADMIN/Desktop/shammas/website/volt/features/notifications/services/notification.service.ts)
- Create: [features/reminders/services/reminder.service.ts](file:///c:/Users/ADMIN/Desktop/shammas/website/volt/features/reminders/services/reminder.service.ts)

- [ ] **Step 1: Implement NotificationService**

Create `features/notifications/services/notification.service.ts`:
```typescript
import { NotificationRepository } from '../repositories/notification.repository';
import { Notification, NotificationType } from '../schemas/notification';
import { UserId } from '@/features/shared/types';

export class NotificationService {
  private static repo = new NotificationRepository();

  public static async createNotification(
    userId: UserId,
    title: string,
    message: string,
    type: NotificationType,
    link?: string
  ): Promise<Notification> {
    return this.repo.create({
      userId,
      title,
      message,
      type,
      link
    });
  }

  public static async getUnreadNotifications(userId: UserId): Promise<Notification[]> {
    return this.repo.findUnread(userId);
  }

  public static async markRead(id: string, userId: UserId): Promise<boolean> {
    return this.repo.markRead(id, userId);
  }

  public static async archiveNotification(id: string, userId: UserId): Promise<boolean> {
    return this.repo.archive(id, userId);
  }

  public static async deleteNotification(id: string, userId: UserId): Promise<boolean> {
    return this.repo.softDelete(id, userId);
  }

  public static async purgeOldNotifications(): Promise<number> {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    return this.repo.hardDeleteExpired(ninetyDaysAgo);
  }
}
```

- [ ] **Step 2: Implement ReminderService and connect to EventBus**

Create `features/reminders/services/reminder.service.ts`:
```typescript
import { ReminderRepository } from '../repositories/reminder.repository';
import { Reminder } from '../schemas/reminder';
import { UserId } from '@/features/shared/types';
import { EventBus } from '@/features/shared/event-bus';
import { NotificationService } from '@/features/notifications/services/notification.service';

export class ReminderService {
  private static repo = new ReminderRepository();

  public static async createReminder(data: Omit<Reminder, 'createdAt' | 'updatedAt' | 'status' | 'notified'>): Promise<Reminder> {
    return this.repo.create({
      ...data,
      status: 'pending',
      notification: {}
    });
  }

  public static async processDueReminders(): Promise<number> {
    const now = new Date();
    const due = await this.repo.findDue(now);
    const bus = EventBus.getInstance();

    for (const reminder of due) {
      // 1. Create notification event via NotificationService
      await NotificationService.createNotification(
        reminder.userId,
        `Reminder: ${reminder.title}`,
        reminder.description || 'Your scheduled reminder is due now.',
        'reminder.due',
        `/reminders`
      );

      // 2. Set complete status
      await this.repo.update(reminder._id!.toString(), reminder.userId, {
        status: 'completed',
        notification: {
          sentAt: now,
          lastNotifiedAt: now
        }
      });

      // 3. Publish to Event Bus
      bus.publish('reminder.completed', { reminderId: reminder._id!.toString(), userId: reminder.userId });
    }

    return due.length;
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add features/notifications/services/notification.service.ts features/reminders/services/reminder.service.ts
git commit -m "feat: implement ReminderService and NotificationService"
```

---

### Task 5: Registry-Based Priority Scheduler & API Route

**Files:**
- Create: [features/automation/registry.ts](file:///c:/Users/ADMIN/Desktop/shammas/website/volt/features/automation/registry.ts)
- Create: [app/api/cron/scheduler/route.ts](file:///c:/Users/ADMIN/Desktop/shammas/website/volt/app/api/cron/scheduler/route.ts)

- [ ] **Step 1: Implement JobRegistry and JobMetric logging**

Create `features/automation/registry.ts`:
```typescript
import { getDb } from '@/lib/db';

export interface JobResult {
  itemsProcessed: number;
}

export interface Job {
  name: string;
  priority: number; // 1 = highest, running first
  run(): Promise<JobResult>;
}

export class JobRegistry {
  constructor(private jobs: Job[]) {}

  async runAll(): Promise<Record<string, { durationMs: number; itemsProcessed: number; success: boolean }>> {
    // Sort jobs by priority ascending
    const sorted = [...this.jobs].sort((a, b) => a.priority - b.priority);
    const results: Record<string, any> = {};

    const db = await getDb();
    const metricsCol = db.collection('job_metrics');

    for (const job of sorted) {
      const start = new Date();
      let success = true;
      let itemsProcessed = 0;
      let error: string | undefined;

      try {
        const res = await job.run();
        itemsProcessed = res.itemsProcessed;
      } catch (err: any) {
        success = false;
        error = err.message || String(err);
      }

      const finish = new Date();
      const durationMs = finish.getTime() - start.getTime();

      results[job.name] = { durationMs, itemsProcessed, success };

      // Write statistics to db
      try {
        await metricsCol.insertOne({
          jobName: job.name,
          startedAt: start,
          finishedAt: finish,
          durationMs,
          success,
          itemsProcessed,
          retryCount: 0,
          status: success ? 'success' : 'failed',
          version: '1.0.0',
          error,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      } catch (dbErr) {
        console.error(`Failed to write job metrics for ${job.name}:`, dbErr);
      }
    }

    return results;
  }
}
```

- [ ] **Step 2: Implement Scheduler Next.js Route handler**

Create `app/api/cron/scheduler/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { JobRegistry, Job } from '@/features/automation/registry';
import { ReminderService } from '@/features/reminders/services/reminder.service';
import { NotificationService } from '@/features/notifications/services/notification.service';

class ReminderJob implements Job {
  name = 'ReminderJob';
  priority = 1;
  async run() {
    const itemsProcessed = await ReminderService.processDueReminders();
    return { itemsProcessed };
  }
}

class CleanupJob implements Job {
  name = 'CleanupJob';
  priority = 4;
  async run() {
    const itemsProcessed = await NotificationService.purgeOldNotifications();
    return { itemsProcessed };
  }
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const registry = new JobRegistry([
      new ReminderJob(),
      new CleanupJob()
    ]);

    const results = await registry.runAll();
    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add features/automation/registry.ts app/api/cron/scheduler/route.ts
git commit -m "feat: implement modular priority scheduler job registry and metrics logger"
```

---

### Task 6: Local Chrono-Node Parsing Utility

**Files:**
- Modify: [package.json](file:///c:/Users/ADMIN/Desktop/shammas/website/volt/package.json)
- Create: [lib/utils/parser.ts](file:///c:/Users/ADMIN/Desktop/shammas/website/volt/lib/utils/parser.ts)

- [ ] **Step 1: Install chrono-node library**

Run:
```bash
npm install chrono-node
```

- [ ] **Step 2: Implement Chrono-Node date parser utility**

Create `lib/utils/parser.ts`:
```typescript
import * as chrono from 'chrono-node';

export interface ParsedReminder {
  title: string;
  triggerAt?: Date;
}

export function parseReminderText(input: string): ParsedReminder {
  const cleanInput = input.trim();
  const results = chrono.parse(cleanInput);

  if (results.length === 0) {
    return { title: cleanInput };
  }

  // Use the first recognized date result
  const match = results[0];
  const triggerAt = match.date();

  // Extract the text leaving out the parsed date segment
  const title = cleanInput.replace(match.text, '').replace(/\s+/g, ' ').trim();

  return {
    title: title || cleanInput,
    triggerAt
  };
}
```

- [ ] **Step 3: Commit**

```bash
git add package.json lib/utils/parser.ts
git commit -m "feat: add chrono-node natural language date parsing utility"
```
