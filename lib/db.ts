import clientPromise from "./mongodb";
import { Category, Resource, Note, Project, Person } from "@/types";
import { cache } from "react";
import { ObjectId } from "mongodb";


// Helper function to recursively convert ObjectId, Date and other objects with custom prototypes/methods into plain serializable values.
export function serialize<T>(obj: T): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(serialize);
  }

  if (obj instanceof Date) {
    return obj.toISOString();
  }

  if (typeof obj === "object") {
    // MongoDB ObjectId has toHexString
    if (typeof (obj as any).toHexString === "function") {
      return (obj as any).toHexString();
    }

    // Fallback checking for ObjectId-like objects
    if (
      (obj as any)._bsontype === "ObjectID" ||
      (obj as any).constructor?.name === "ObjectID" ||
      (obj as any).constructor?.name === "ObjectId"
    ) {
      return (obj as any).toString();
    }

    const result: any = {};
    for (const key of Object.keys(obj)) {
      result[key] = serialize((obj as any)[key]);
    }
    return result;
  }

  return obj;
}

const globalWithIndexes = global as typeof globalThis & {
  _mongoIndexesEnsured?: boolean;
};

export function mapResourceDoc(r: any): Resource {
  return {
    ...r,
    _id: r._id?.toString(),
    id: r._id?.toString() || r.id || "",
    name: r.title || r.name || "",
    link: r.url || r.link || "",
    category: r.categoryId || r.category || "",
    description: r.description || "",
    featured: r.favorite || r.featured || false,
    logo: r.logo || "",
    order: r.order || 0,
    title: r.title || r.name || "",
    url: r.url || r.link || "",
    categoryId: r.categoryId || r.category || "",
    favorite: r.favorite || r.featured || false,
    tags: r.tags || [],
    projectIds: r.projectIds || [],
    personIds: r.personIds || [],
    useCount: r.useCount || 0,
    status: r.status || "saved",
    type: r.type || "website",
    userId: r.userId || "",
    createdAt: r.createdAt || new Date(),
    updatedAt: r.updatedAt || new Date()
  };
}

export function mapNoteDoc(n: any): Note {
  return {
    ...n,
    _id: n._id?.toString(),
    id: n._id?.toString() || n.id || "",
    title: n.title || "",
    content: n.content || "",
    tags: n.tags || [],
    userId: n.userId || "",
    pinned: !!n.pinned,
    relatedResources: n.relatedResources || [],
    relatedProjects: n.relatedProjects || [],
    relatedPeople: n.relatedPeople || [],
    createdAt: n.createdAt || new Date(),
    updatedAt: n.updatedAt || new Date()
  };
}

export const getDb = cache(async () => {
  const client = await clientPromise;
  const db = client.db();

  if (!globalWithIndexes._mongoIndexesEnsured) {
    Promise.all([
      // Resources indexes
      db.collection("resources").createIndex({ userId: 1, createdAt: -1 }),
      db.collection("resources").createIndex({ userId: 1, favorite: 1 }),
      db.collection("resources").createIndex({ userId: 1, recentlyViewedAt: -1 }),
      db.collection("resources").createIndex({ userId: 1, useCount: -1, recentlyUsedAt: -1 }),
      db.collection("resources").createIndex({ userId: 1, order: 1, createdAt: -1 }),
      db.collection("resources").createIndex({ userId: 1, categoryId: 1 }),
      db.collection("resources").createIndex({ userId: 1, category: 1 }),
      db.collection("resources").createIndex({ userId: 1, projectIds: 1 }),
      db.collection("resources").createIndex({ userId: 1, personIds: 1 }),
      db.collection("resources").createIndex({ title: "text", url: "text", tags: "text", description: "text", whySaved: "text", notes: "text" }),

      // Notes indexes
      db.collection("notes").createIndex({ userId: 1, pinned: -1, updatedAt: -1 }),
      db.collection("notes").createIndex({ userId: 1, relatedProjects: 1 }),
      db.collection("notes").createIndex({ userId: 1, relatedPeople: 1 }),
      db.collection("notes").createIndex({ title: "text", content: "text", tags: "text" }),

      // People indexes
      db.collection("people").createIndex({ userId: 1, name: 1 }),
      db.collection("people").createIndex({ name: "text", notes: "text", tags: "text" }),

      // Projects indexes
      db.collection("projects").createIndex({ userId: 1, updatedAt: -1 }),
      db.collection("projects").createIndex({ name: "text", description: "text" }),

      // Categories indexes
      db.collection("categories").createIndex({ userId: 1, name: 1 }),
      db.collection("categories").createIndex({ name: "text", description: "text" }),

      // Watchlist indexes
      db.collection("watchlist").createIndex({ userId: 1, source: 1, externalId: 1 }, { unique: true }),
      db.collection("watchlist").createIndex({ userId: 1, status: 1, type: 1 }),
      db.collection("watchlist").createIndex({ userId: 1, updatedAt: -1 })
    ]).catch(err => console.error("Error ensuring database indexes:", err));

    globalWithIndexes._mongoIndexesEnsured = true;
  }
  return db;
});
