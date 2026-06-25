import { getCachedReminders } from "@/features/reminders/queries/reminders";
import { RemindersContent } from "./reminders-content";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Metadata } from "next";
import { getSessionUser } from "@/lib/auth-utils";
import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";

export const metadata: Metadata = {
  title: "Reminders - Volt",
  description: "Manage checklists, tasks, and today's dynamic event timeline.",
};

async function populateAttachments(reminders: any[]) {
  const db = await getDb();
  
  const idMap: Record<string, Set<string>> = {
    note: new Set(),
    project: new Set(),
    person: new Set(),
    resource: new Set(),
    watchlist: new Set()
  };

  reminders.forEach(r => {
    if (r.attachments) {
      r.attachments.forEach((a: any) => {
        if (idMap[a.type] && a.id) {
          idMap[a.type].add(a.id);
        }
      });
    }
  });

  const titlesMap: Record<string, Record<string, string>> = {
    note: {},
    project: {},
    person: {},
    resource: {},
    watchlist: {}
  };

  // 1. Notes
  const noteIds = Array.from(idMap.note).map(id => ObjectId.isValid(id) ? new ObjectId(id) : id);
  if (noteIds.length > 0) {
    const notes = await db.collection('notes').find({ _id: { $in: noteIds as any } }, { projection: { title: 1 } }).toArray();
    notes.forEach(n => {
      titlesMap.note[n._id.toString()] = n.title;
    });
  }

  // 2. Projects
  const projectIds = Array.from(idMap.project).map(id => ObjectId.isValid(id) ? new ObjectId(id) : id);
  if (projectIds.length > 0) {
    const projects = await db.collection('projects').find({ _id: { $in: projectIds as any } }, { projection: { name: 1, title: 1 } }).toArray();
    projects.forEach(p => {
      titlesMap.project[p._id.toString()] = p.name || p.title || 'Untitled Project';
    });
  }

  // 3. People
  const personIds = Array.from(idMap.person).map(id => ObjectId.isValid(id) ? new ObjectId(id) : id);
  if (personIds.length > 0) {
    const people = await db.collection('people').find({ _id: { $in: personIds as any } }, { projection: { name: 1 } }).toArray();
    people.forEach(p => {
      titlesMap.person[p._id.toString()] = p.name || 'Unnamed Person';
    });
  }

  // 4. Resources
  const resourceIds = Array.from(idMap.resource).map(id => ObjectId.isValid(id) ? new ObjectId(id) : id);
  if (resourceIds.length > 0) {
    const resources = await db.collection('resources').find({ _id: { $in: resourceIds as any } }, { projection: { title: 1 } }).toArray();
    resources.forEach(r => {
      titlesMap.resource[r._id.toString()] = r.title;
    });
  }

  // 5. Watchlist
  const watchlistIds = Array.from(idMap.watchlist).map(id => ObjectId.isValid(id) ? new ObjectId(id) : id);
  if (watchlistIds.length > 0) {
    const watchlist = await db.collection('watchlist').find({ _id: { $in: watchlistIds as any } }, { projection: { 'metadata.title': 1 } }).toArray();
    watchlist.forEach(w => {
      titlesMap.watchlist[w._id.toString()] = w.metadata?.title || 'Untitled Watchlist Item';
    });
  }

  return reminders.map(r => {
    if (r.attachments) {
      r.attachments = r.attachments.map((a: any) => ({
        ...a,
        title: titlesMap[a.type][a.id] || `Attached ${a.type}`
      }));
    } else {
      r.attachments = [];
    }
    return r;
  });
}

function RemindersSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6 pb-12">
      {/* Header section */}
      <section className="px-4 pt-8 lg:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between max-w-7xl">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-48 md:h-10" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-5 w-80 max-w-full mt-2" />
          </div>
        </div>
      </section>

      {/* Content skeleton */}
      <section className="px-4 lg:px-6">
        <div className="max-w-7xl grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-[400px] w-full rounded-2xl" />
          </div>
          <div>
            <Skeleton className="h-[400px] w-full rounded-2xl" />
          </div>
        </div>
      </section>
    </div>
  );
}

async function RemindersContentWrapper() {
  const user = await getSessionUser();
  const db = await getDb();
  
  const initialReminders = await getCachedReminders(user.id);
  const populated = await populateAttachments(initialReminders);

  const notes = await db.collection("notes").find({ userId: user.id, deletedAt: { $exists: false } }).sort({ title: 1 }).toArray();
  const projects = await db.collection("projects").find({ userId: user.id, deletedAt: { $exists: false } }).sort({ name: 1 }).toArray();

  return (
    <RemindersContent 
      initialReminders={JSON.parse(JSON.stringify(populated))} 
      notes={JSON.parse(JSON.stringify(notes))} 
      projects={JSON.parse(JSON.stringify(projects))} 
    />
  );
}

export default function RemindersPage() {
  return (
    <Suspense fallback={<RemindersSkeleton />}>
      <RemindersContentWrapper />
    </Suspense>
  );
}
