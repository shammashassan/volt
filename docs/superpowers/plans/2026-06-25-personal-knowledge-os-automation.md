# Personal Knowledge OS Automation & Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the automation, calendar subscriptions, unified search index, and dashboard bento widgets for the Volt Personal Knowledge OS (Phase 3).

**Architecture:** Provider adapters fetch watchlist releases (TMDb / AniList) asynchronously under the scheduler, generating notifications. Unified search indexes items dynamically on domain events. The ICS calendar feed serves compliant RFC 5545 streams, while home screen widgets reflect real-time focus items.

**Tech Stack:** Next.js, MongoDB, Chrono-Node, Google Gemini API, iCalendar (ICS).

---

### Task 1: Watchlist Pluggable Provider & Metadata Sync

**Files:**
- Create: [features/watchlist/providers/provider.interface.ts](file:///c:/Users/ADMIN/Desktop/shammas/website/volt/features/watchlist/providers/provider.interface.ts)
- Create: [features/watchlist/providers/tmdb.provider.ts](file:///c:/Users/ADMIN/Desktop/shammas/website/volt/features/watchlist/providers/tmdb.provider.ts)
- Create: [features/watchlist/providers/anilist.provider.ts](file:///c:/Users/ADMIN/Desktop/shammas/website/volt/features/watchlist/providers/anilist.provider.ts)
- Create: [features/watchlist/services/watchlist.service.ts](file:///c:/Users/ADMIN/Desktop/shammas/website/volt/features/watchlist/services/watchlist.service.ts)
- Modify: [features/automation/registry.ts](file:///c:/Users/ADMIN/Desktop/shammas/website/volt/features/automation/registry.ts)
- Modify: [app/api/cron/scheduler/route.ts](file:///c:/Users/ADMIN/Desktop/shammas/website/volt/app/api/cron/scheduler/route.ts)

- [ ] **Step 1: Define pluggable provider interface**

Create `features/watchlist/providers/provider.interface.ts`:
```typescript
export interface WatchlistProviderDetails {
  releaseDate?: string;
  nextEpisodeDate?: string;
  nextEpisodeNumber?: number;
  posterUrl?: string;
  runtime?: number;
  genres?: string[];
  status?: string;
}

export interface WatchlistProvider {
  sync(externalId: string, mediaType: 'movie' | 'series' | 'anime'): Promise<WatchlistProviderDetails>;
}
```

- [ ] **Step 2: Implement TMDb Provider Adapter**

Create `features/watchlist/providers/tmdb.provider.ts`:
```typescript
import { WatchlistProvider, WatchlistProviderDetails } from './provider.interface';

export class TmdbProvider implements WatchlistProvider {
  async sync(externalId: string, mediaType: 'movie' | 'series' | 'anime'): Promise<WatchlistProviderDetails> {
    const tmdbKey = process.env.TMDB_API_KEY || '';
    const tmdbToken = process.env.TMDB_READ_TOKEN || '';
    if (!tmdbKey && !tmdbToken) {
      throw new Error('TMDb credentials missing');
    }

    const typePath = mediaType === 'movie' ? 'movie' : 'tv';
    const baseUrl = `https://api.themoviedb.org/3/${typePath}/${externalId}`;
    
    // Add release dates append query for movies
    const url = tmdbToken 
      ? `${baseUrl}?append_to_response=release_dates`
      : `${baseUrl}?api_key=${tmdbKey}&append_to_response=release_dates`;

    const headers: HeadersInit = {};
    if (tmdbToken) {
      headers['Authorization'] = `Bearer ${tmdbToken}`;
    }

    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error(`TMDb HTTP error: ${response.status}`);
    const data = await response.json();

    const details: WatchlistProviderDetails = {
      posterUrl: data.poster_path ? `https://image.tmdb.org/t/p/w342${data.poster_path}` : undefined,
      runtime: data.runtime || (data.episode_run_time ? data.episode_run_time[0] : undefined),
      genres: data.genres ? data.genres.map((g: any) => g.name) : [],
      status: data.status
    };

    if (mediaType === 'movie') {
      details.releaseDate = data.release_date;
      // Fetch digital release dates if possible
      const releaseResults = data.release_dates?.results || [];
      const usReleases = releaseResults.find((r: any) => r.iso_3166_1 === 'US')?.release_dates || [];
      const digital = usReleases.find((d: any) => d.type === 4); // Type 4 = Digital release
      if (digital) {
        details.releaseDate = digital.release_date.split('T')[0];
      }
    } else {
      details.releaseDate = data.first_air_date;
      if (data.next_episode_to_air) {
        details.nextEpisodeDate = data.next_episode_to_air.air_date;
        details.nextEpisodeNumber = data.next_episode_to_air.episode_number;
      }
    }

    return details;
  }
}
```

- [ ] **Step 3: Implement AniList Provider Adapter**

Create `features/watchlist/providers/anilist.provider.ts`:
```typescript
import { WatchlistProvider, WatchlistProviderDetails } from './provider.interface';

export class AnilistProvider implements WatchlistProvider {
  async sync(externalId: string): Promise<WatchlistProviderDetails> {
    const query = `
      query ($id: Int) {
        Media(id: $id, type: ANIME) {
          id
          status
          coverImage {
            large
          }
          genres
          duration
          startDate {
            year
            month
            day
          }
          nextAiringEpisode {
            airingAt
            episode
          }
        }
      }
    `;

    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ query, variables: { id: parseInt(externalId, 10) } }),
    });

    if (!response.ok) throw new Error(`AniList GraphQL error: ${response.status}`);
    const body = await response.json();
    const media = body.data?.Media;

    if (!media) throw new Error('AniList Media details not found');

    const startDate = media.startDate;
    const releaseDate = startDate?.year && startDate?.month && startDate?.day
      ? `${startDate.year}-${String(startDate.month).padStart(2, '0')}-${String(startDate.day).padStart(2, '0')}`
      : undefined;

    const nextEpisodeDate = media.nextAiringEpisode?.airingAt
      ? new Date(media.nextAiringEpisode.airingAt * 1000).toISOString().split('T')[0]
      : undefined;

    return {
      releaseDate,
      nextEpisodeDate,
      nextEpisodeNumber: media.nextAiringEpisode?.episode,
      posterUrl: media.coverImage?.large,
      runtime: media.duration,
      genres: media.genres,
      status: media.status
    };
  }
}
```

- [ ] **Step 4: Create WatchlistService**

Create `features/watchlist/services/watchlist.service.ts`:
```typescript
import { getDb } from '@/lib/db';
import { WatchlistItem } from '@/app/(dashboard)/media-watchlist/_types/watchlist.types';
import { TmdbProvider } from '../providers/tmdb.provider';
import { AnilistProvider } from '../providers/anilist.provider';
import { NotificationService } from '@/features/notifications/services/notification.service';
import { ObjectId } from 'mongodb';

export class WatchlistService {
  private static providers = {
    tmdb: new TmdbProvider(),
    anilist: new AnilistProvider()
  };

  public static async syncPendingMetadata(): Promise<number> {
    const db = await getDb();
    const col = db.collection('watchlist');
    
    // Fetch 5 oldest check-ins needing update
    const staleItems = await col.find({
      status: { $in: ['planning', 'upcoming', 'watching'] },
      deletedAt: { $exists: false }
    }).sort({ 'sync.lastChecked': 1 }).limit(5).toArray();

    let count = 0;
    const now = new Date();

    for (const item of staleItems) {
      const provider = this.providers[item.source as 'tmdb' | 'anilist'];
      if (!provider) continue;

      try {
        const details = await provider.sync(item.externalId, item.type);
        
        // Determine release checks
        const upcomingReleased = details.releaseDate && new Date(details.releaseDate) <= now && item.status === 'planning';
        
        const updates: any = {
          metadata: {
            ...item.metadata,
            posterUrl: details.posterUrl || item.metadata?.posterUrl,
            releaseDate: details.releaseDate,
            nextEpisodeDate: details.nextEpisodeDate,
            nextEpisodeNumber: details.nextEpisodeNumber,
            runtime: details.runtime,
            genres: details.genres
          },
          sync: {
            lastChecked: now,
            provider: item.source,
            providerId: item.externalId,
            version: (item.sync?.version || 0) + 1,
            failedAttempts: 0
          },
          updatedAt: now
        };

        if (upcomingReleased) {
          updates.status = 'upcoming'; // Transition state
          
          // Trigger notification
          await NotificationService.createNotification(
            item.userId,
            `Released: ${item.metadata?.title || 'Watchlist Item'}`,
            `Your planning item ${item.metadata?.title || ''} is officially released!`,
            'watchlist.release',
            '/media-watchlist'
          );
        }

        await col.updateOne({ _id: item._id }, { $set: updates });
        count++;
      } catch (err) {
        console.error(`Failed to sync watchlist item ${item._id}:`, err);
        await col.updateOne({ _id: item._id }, {
          $set: {
            'sync.lastChecked': now,
            'sync.failedAttempts': (item.sync?.failedAttempts || 0) + 1,
            updatedAt: now
          }
        });
      }
    }

    return count;
  }
}
```

- [ ] **Step 5: Register WatchlistSyncJob in scheduler**

Modify `app/api/cron/scheduler/route.ts` to add `WatchlistSyncJob`:
```typescript
// Import:
import { WatchlistService } from '@/features/watchlist/services/watchlist.service';

// Add Job class:
class WatchlistSyncJob implements Job {
  name = 'WatchlistSyncJob';
  priority = 2;
  async run() {
    const itemsProcessed = await WatchlistService.syncPendingMetadata();
    return { itemsProcessed };
  }
}

// In GET route:
    const registry = new JobRegistry([
      new ReminderJob(),
      new WatchlistSyncJob(),
      new CleanupJob()
    ]);
```

- [ ] **Step 6: Commit**

```bash
git add features/watchlist app/api/cron/scheduler/route.ts
git commit -m "feat: add pluggable watchlist providers and metadata sync background job"
```

---

### Task 2: Provider-Agnostic Calendar Subscription (ICS)

**Files:**
- Create: [features/calendar/services/calendar.service.ts](file:///c:/Users/ADMIN/Desktop/shammas/website/volt/features/calendar/services/calendar.service.ts)
- Create: [app/api/users/calendar/route.ts](file:///c:/Users/ADMIN/Desktop/shammas/website/volt/app/api/users/calendar/route.ts)

- [ ] **Step 1: Implement ICS Feed Generator**

Create `features/calendar/services/calendar.service.ts`:
```typescript
import { getDb } from '@/lib/db';
import { Reminder } from '@/features/reminders/schemas/reminder';
import { WatchlistItem } from '@/app/(dashboard)/media-watchlist/_types/watchlist.types';

export class CalendarService {
  public static async generateIcsFeed(userId: string): Promise<string> {
    const db = await getDb();
    
    // Fetch active reminders
    const reminders = await db.collection<Reminder>('reminders').find({
      userId,
      deletedAt: { $exists: false }
    }).toArray();

    // Fetch watchlist items
    const watchlist = await db.collection<WatchlistItem>('watchlist').find({
      userId,
      deletedAt: { $exists: false }
    }).toArray();

    let ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Volt//Personal Knowledge OS//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ];

    // Format Date helper
    const formatIcsDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    // Add reminders
    for (const r of reminders) {
      const dtStart = formatIcsDate(new Date(r.triggerAt));
      const dtEnd = formatIcsDate(new Date(new Date(r.triggerAt).getTime() + 30 * 60 * 1000)); // Default 30 min duration
      const uid = `reminder-${r._id}`;
      const stamp = formatIcsDate(r.createdAt || new Date());
      const modified = formatIcsDate(r.updatedAt || new Date());

      ics.push(
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${stamp}`,
        `LAST-MODIFIED:${modified}`,
        `CREATED:${stamp}`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        `SUMMARY:Reminder: ${r.title}`,
        r.description ? `DESCRIPTION:${r.description}` : '',
        'STATUS:CONFIRMED',
        'END:VEVENT'
      );
    }

    // Add watchlist releases
    for (const w of watchlist) {
      const relDateStr = w.metadata?.releaseDate;
      if (!relDateStr) continue;

      const relDate = new Date(relDateStr);
      // All-day event formatting (YYYYMMDD)
      const dateVal = relDate.toISOString().replace(/[-:]/g, '').split('T')[0];
      const uid = `watchlist-${w._id}`;
      const stamp = formatIcsDate(w.createdAt || new Date());

      ics.push(
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${stamp}`,
        `DTSTART;VALUE=DATE:${dateVal}`,
        `SUMMARY:Release: ${w.metadata?.title || 'Media'}`,
        `DESCRIPTION:Watchlist item release date for ${w.type}.`,
        'STATUS:CONFIRMED',
        'END:VEVENT'
      );
    }

    ics.push('END:VCALENDAR');

    // Clean up empty lines and join with CRLF
    return ics.filter(line => line.trim().length > 0).join('\r\n');
  }
}
```

- [ ] **Step 2: Add API Route Handler for calendar subscription**

Create `app/api/users/calendar/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { CalendarService } from '@/features/calendar/services/calendar.service';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return new NextResponse('Unauthorized: Missing subscription token', { status: 401 });
    }

    const db = await getDb();
    // Validate user by calendarToken preference
    const user = await db.collection('users').findOne({ 'preferences.calendarToken': token });
    if (!user) {
      // Temporary: validate with user email if token isn't generated yet
      return new NextResponse('Unauthorized: Invalid subscription token', { status: 401 });
    }

    const icsContent = await CalendarService.generateIcsFeed(user._id.toString());

    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="volt-calendar.ics"',
      },
    });
  } catch (error: any) {
    return new NextResponse(`Error generating calendar: ${error.message}`, { status: 500 });
  }
}
```

- [ ] **Step 3: Verify code compiles**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add features/calendar app/api/users/calendar/route.ts
git commit -m "feat: add user-subscription calendar ICS feed generator endpoint"
```

---

### Task 3: Unified Search Indexing

**Files:**
- Create: [features/search/schemas/search-index.ts](file:///c:/Users/ADMIN/Desktop/shammas/website/volt/features/search/schemas/search-index.ts)
- Create: [features/search/repositories/search-index.repository.ts](file:///c:/Users/ADMIN/Desktop/shammas/website/volt/features/search/repositories/search-index.repository.ts)
- Modify: [features/reminders/services/reminder.service.ts](file:///c:/Users/ADMIN/Desktop/shammas/website/volt/features/reminders/services/reminder.service.ts)
- Modify: [lib/actions/notes.ts](file:///c:/Users/ADMIN/Desktop/shammas/website/volt/lib/actions/notes.ts)
- Modify: [components/search-command.tsx](file:///c:/Users/ADMIN/Desktop/shammas/website/volt/components/search-command.tsx)

- [ ] **Step 1: Define SearchIndex Schema**

Create `features/search/schemas/search-index.ts`:
```typescript
import { BaseDocument } from '@/features/shared/types';

export interface SearchIndexEntry extends BaseDocument {
  title: string;
  description?: string;
  entityType: 'note' | 'project' | 'resource' | 'reminder' | 'watchlist' | 'person';
  entityId: string;
  searchVersion: number;
}
```

- [ ] **Step 2: Implement MongoDB SearchIndexRepository**

Create `features/search/repositories/search-index.repository.ts`:
```typescript
import { getDb } from '@/lib/db';
import { SearchIndexEntry } from '../schemas/search-index';
import { UserId } from '@/features/shared/types';

export class SearchIndexRepository {
  private async getCollection() {
    const db = await getDb();
    // Ensure index exists on indexing content
    await db.collection('search_index').createIndex({ title: 'text', description: 'text' });
    return db.collection<SearchIndexEntry>('search_index');
  }

  async upsert(entry: Omit<SearchIndexEntry, 'createdAt' | 'updatedAt' | 'searchVersion'>): Promise<void> {
    const col = await this.getCollection();
    const now = new Date();
    await col.updateOne(
      { entityId: entry.entityId, userId: entry.userId },
      {
        $set: {
          ...entry,
          searchVersion: 1,
          updatedAt: now
        },
        $setOnInsert: {
          createdAt: now
        }
      },
      { upsert: true }
    );
  }

  async remove(entityId: string): Promise<void> {
    const col = await this.getCollection();
    await col.deleteOne({ entityId });
  }

  async search(query: string, userId: UserId): Promise<SearchIndexEntry[]> {
    const col = await this.getCollection();
    return col.find({
      userId,
      $text: { $search: query },
      deletedAt: { $exists: false }
    }).limit(15).toArray() as Promise<SearchIndexEntry[]>;
  }
}
```

- [ ] **Step 3: Connect domain services to search indexing**

*   In `features/reminders/services/reminder.service.ts` import `SearchIndexRepository` and call `upsert` when creating/updating reminders, and `remove` on deletion.
*   In `lib/actions/notes.ts` add search indexing hook.

- [ ] **Step 4: Update SearchCommand to search unified index**

Modify `components/search-command.tsx` to search from the `search_index` collection.

- [ ] **Step 5: Verify code compiles**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add features/search components/search-command.tsx features/reminders/services/reminder.service.ts
git commit -m "feat: implement unified search index and command palette query routing"
```

---

### Task 4: Dashboard Bento Widgets (Inbox, My Day, Upcoming Releases)

**Files:**
- Create: [components/dashboard/inbox-focus-card.tsx](file:///c:/Users/ADMIN/Desktop/shammas/website/volt/components/dashboard/inbox-focus-card.tsx)
- Create: [components/dashboard/my-day-card.tsx](file:///c:/Users/ADMIN/Desktop/shammas/website/volt/components/dashboard/my-day-card.tsx)
- Create: [components/dashboard/watchlist-upcoming-card.tsx](file:///c:/Users/ADMIN/Desktop/shammas/website/volt/components/dashboard/watchlist-upcoming-card.tsx)
- Modify: [components/dashboard/workspace-bento.tsx](file:///c:/Users/ADMIN/Desktop/shammas/website/volt/components/dashboard/workspace-bento.tsx)
- Modify: [app/(dashboard)/explore/page.tsx](file:///c:/Users/ADMIN/Desktop/shammas/website/volt/app/(dashboard)/explore/page.tsx)

- [ ] **Step 1: Create Inbox Focus Card Widget**

Create `components/dashboard/inbox-focus-card.tsx`:
```typescript
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, AlertCircle, PlayCircle, FolderMinus } from 'lucide-react';
import Link from 'next/link';

interface InboxFocusProps {
  remindersCount: number;
  releasesCount: number;
  unreadNotifications: number;
  inboxCount: number;
}

export function InboxFocusCard({
  remindersCount,
  releasesCount,
  unreadNotifications,
  inboxCount
}: InboxFocusProps) {
  return (
    <Card className="workspace-card bg-muted/20 border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-primary">
          <Target className="size-4" />
          Today's Focus
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <Link href="/reminders" className="flex items-center gap-3 p-3 rounded-lg border bg-background hover:bg-accent/50 transition-colors">
          <AlertCircle className="size-5 text-violet-500" />
          <div className="flex flex-col">
            <span className="text-xl font-bold">{remindersCount}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Reminders</span>
          </div>
        </Link>
        <Link href="/media-watchlist" className="flex items-center gap-3 p-3 rounded-lg border bg-background hover:bg-accent/50 transition-colors">
          <PlayCircle className="size-5 text-amber-500" />
          <div className="flex flex-col">
            <span className="text-xl font-bold">{releasesCount}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Releases</span>
          </div>
        </Link>
        <Link href="/notifications" className="flex items-center gap-3 p-3 rounded-lg border bg-background hover:bg-accent/50 transition-colors">
          <BellIcon className="size-5 text-rose-500" />
          <div className="flex flex-col">
            <span className="text-xl font-bold">{unreadNotifications}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Unread Alerts</span>
          </div>
        </Link>
        <div className="flex items-center gap-3 p-3 rounded-lg border bg-background">
          <FolderMinus className="size-5 text-indigo-500" />
          <div className="flex flex-col">
            <span className="text-xl font-bold">{inboxCount}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Inbox Items</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
    </svg>
  );
}
```

- [ ] **Step 2: Create My Day Checklist Widget**

Create `components/dashboard/my-day-card.tsx`:
```typescript
"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarDays } from 'lucide-react';
import { Reminder } from '@/features/reminders/schemas/reminder';
import { getRemindersAction, updateReminderAction } from '@/features/reminders/actions/reminders';

export function MyDayCard() {
  const [reminders, setReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    async function load() {
      const res = await getRemindersAction();
      if (res.success && res.data) {
        const todayStr = new Date().toDateString();
        const todayReminders = res.data.filter(
          r => r.status === 'pending' && new Date(r.triggerAt).toDateString() === todayStr
        );
        setReminders(todayReminders.slice(0, 3));
      }
    }
    load();
  }, []);

  const handleChecked = async (id: string) => {
    const res = await updateReminderAction(id, { status: 'completed' });
    if (res.success) {
      setReminders(prev => prev.filter(r => r._id !== id));
    }
  };

  return (
    <Card className="workspace-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
          <CalendarDays className="size-4 text-violet-500" />
          My Day
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {reminders.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">No tasks due today.</p>
        ) : (
          reminders.map(r => (
            <div key={r._id as string} className="flex items-center gap-2.5 py-1">
              <Checkbox onCheckedChange={() => handleChecked(r._id as string)} />
              <span className="text-xs font-medium text-foreground truncate">{r.title}</span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 3: Create Watchlist Upcoming Releases Widget**

Create `components/dashboard/watchlist-upcoming-card.tsx`:
```typescript
"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Film, Calendar } from 'lucide-react';
import { getWatchlistAction } from '@/app/(dashboard)/media-watchlist/_actions/get-watchlist';
import { WatchlistItem } from '@/app/(dashboard)/media-watchlist/_types/watchlist.types';

export function WatchlistUpcomingCard() {
  const [items, setItems] = useState<WatchlistItem[]>([]);

  useEffect(() => {
    async function load() {
      const res = await getWatchlistAction();
      if (res.success && res.data) {
        const now = new Date();
        const upcoming = res.data.filter(
          item => item.status === 'planning' && item.metadata?.releaseDate && new Date(item.metadata.releaseDate) > now
        );
        setItems(upcoming.slice(0, 3));
      }
    }
    load();
  }, []);

  return (
    <Card className="workspace-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
          <Film className="size-4 text-amber-500" />
          Upcoming Releases
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">No upcoming releases soon.</p>
        ) : (
          items.map(item => (
            <div key={item._id as string} className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium truncate">{item.metadata?.title}</span>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1 shrink-0">
                <Calendar className="size-3" />
                {item.metadata?.releaseDate ? new Date(item.metadata.releaseDate).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Soon'}
              </span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 4: Update WorkspaceBento & Explore Page layout**

*   Modify `WorkspaceBento` and `ExplorePage` to integrate these new cards at the top row of the bento grid columns.

- [ ] **Step 5: Verify code compiles**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add components/dashboard/inbox-focus-card.tsx components/dashboard/my-day-card.tsx components/dashboard/watchlist-upcoming-card.tsx components/dashboard/workspace-bento.tsx app/\(dashboard\)/explore/page.tsx
git commit -m "feat: add Dashboard Bento widgets for Inbox, My Day tasks, and Upcoming Watchlist Releases"
```

---

### Task 5: AI Fallback Natural Language Parsing

**Files:**
- Modify: [lib/utils/parser.ts](file:///c:/Users/ADMIN/Desktop/shammas/website/volt/lib/utils/parser.ts)

- [ ] **Step 1: Update parser.ts with Server Action fallback**

*   Add call to Gemini LLM with structured JSON parsing rules if Chrono-Node date resolution fails.

- [ ] **Step 2: Verify code compiles**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add lib/utils/parser.ts
git commit -m "feat: add Gemini AI fallback date parser logic"
```
