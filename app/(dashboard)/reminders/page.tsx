import { getCachedReminders } from "@/lib/queries/reminders";
import { RemindersContent } from "@/components/reminders/reminders-view";
import type { Metadata } from "next";
import { getSessionUser } from "@/lib/auth-utils";
import { getDb } from "@/lib/db";
import { ObjectId, Filter, Document } from "mongodb";
import type { Reminder, ReminderAttachment } from "@/types/reminder";

export const metadata: Metadata = {
  title: "Reminders",
  description: "Manage checklists, tasks, and today's dynamic event timeline.",
};

async function populateAttachments(reminders: Reminder[]) {
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
      r.attachments.forEach((a: ReminderAttachment) => {
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
    const filter = { _id: { $in: noteIds as unknown as ObjectId[] } };
    const notes = await db.collection('notes').find(filter, { projection: { title: 1 } }).toArray();
    notes.forEach(n => {
      titlesMap.note[n._id.toString()] = n.title;
    });
  }

  // 2. Projects
  const projectIds = Array.from(idMap.project).map(id => ObjectId.isValid(id) ? new ObjectId(id) : id);
  if (projectIds.length > 0) {
    const filter = { _id: { $in: projectIds as unknown as ObjectId[] } };
    const projects = await db.collection('projects').find(filter, { projection: { name: 1, title: 1 } }).toArray();
    projects.forEach(p => {
      titlesMap.project[p._id.toString()] = p.name || p.title || 'Untitled Project';
    });
  }

  // 3. People
  const personIds = Array.from(idMap.person).map(id => ObjectId.isValid(id) ? new ObjectId(id) : id);
  if (personIds.length > 0) {
    const filter = { _id: { $in: personIds as unknown as ObjectId[] } };
    const people = await db.collection('people').find(filter, { projection: { name: 1 } }).toArray();
    people.forEach(p => {
      titlesMap.person[p._id.toString()] = p.name || 'Unnamed Person';
    });
  }

  // 4. Resources
  const resourceIds = Array.from(idMap.resource).map(id => ObjectId.isValid(id) ? new ObjectId(id) : id);
  if (resourceIds.length > 0) {
    const filter = { _id: { $in: resourceIds as unknown as ObjectId[] } };
    const resources = await db.collection('resources').find(filter, { projection: { title: 1 } }).toArray();
    resources.forEach(r => {
      titlesMap.resource[r._id.toString()] = r.title;
    });
  }

  // 5. Watchlist
  const watchlistIds = Array.from(idMap.watchlist).map(id => ObjectId.isValid(id) ? new ObjectId(id) : id);
  if (watchlistIds.length > 0) {
    const filter = { _id: { $in: watchlistIds as unknown as ObjectId[] } };
    const watchlist = await db.collection('watchlist').find(filter, { projection: { 'metadata.title': 1 } }).toArray();
    watchlist.forEach(w => {
      titlesMap.watchlist[w._id.toString()] = w.metadata?.title || 'Untitled Watchlist Item';
    });
  }

  return reminders.map(r => {
    if (r.attachments) {
      r.attachments = r.attachments.map((a: ReminderAttachment) => ({
        ...a,
        title: titlesMap[a.type][a.id] || `Attached ${a.type}`
      }));
    } else {
      r.attachments = [];
    }
    return r;
  });
}

export default async function RemindersPage() {
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
