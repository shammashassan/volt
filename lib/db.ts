import clientPromise from "./mongodb";
import { Category, Resource, Note, Project, Person } from "./types";
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
      db.collection("resources").createIndex({ title: "text", url: "text", tags: "text", description: "text", whySaved: "text", notes: "text" }),
      
      // Notes indexes
      db.collection("notes").createIndex({ userId: 1, pinned: -1, updatedAt: -1 }),
      db.collection("notes").createIndex({ title: "text", content: "text", tags: "text" }),
      
      // People indexes
      db.collection("people").createIndex({ userId: 1, name: 1 }),
      db.collection("people").createIndex({ name: "text", notes: "text", tags: "text" }),
      
      // Projects indexes
      db.collection("projects").createIndex({ userId: 1, updatedAt: -1 }),
      db.collection("projects").createIndex({ name: "text", description: "text" }),
      
      // Categories indexes
      db.collection("categories").createIndex({ userId: 1, name: 1 }),
      db.collection("categories").createIndex({ name: "text", description: "text" })
    ]).catch(err => console.error("Error ensuring database indexes:", err));
    
    globalWithIndexes._mongoIndexesEnsured = true;
  }
  return db;
});

export const getCategories = cache(async (userId: string): Promise<Category[]> => {
  const db = await getDb();
  const categories = await db.collection("categories").find({ userId }).sort({ order: 1, name: 1 }).toArray();
  return serialize(categories.map(c => ({
    ...c,
    _id: c._id?.toString(),
    id: c.id || c._id?.toString() || "",
    title: c.name || c.title || "",
    icon: c.icon || "Rocket",
    description: c.description || "",
    order: c.order || 0,
    name: c.name || c.title || "",
    createdAt: c.createdAt || new Date(),
    updatedAt: c.updatedAt || new Date(),
    userId: c.userId || ""
  }))) as unknown as Category[];
});

export const getResources = cache(async (userId: string): Promise<Resource[]> => {
  const db = await getDb();
  const resources = await db.collection("resources").find({ userId }).sort({ order: 1, createdAt: -1 }).toArray();
  return serialize(resources.map(r => ({
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
  }))) as unknown as Resource[];
});

export const getCategoryById = cache(async (id: string, userId: string): Promise<Category | null> => {
  const db = await getDb();
  const query: Record<string, unknown> = { userId };
  if (ObjectId.isValid(id)) {
    query._id = new ObjectId(id);
  } else {
    query.id = id;
  }
  const category = await db.collection("categories").findOne(query);
  if (!category) return null;
  return serialize({
    ...category,
    _id: category._id?.toString(),
    id: category.id || category._id?.toString() || "",
    title: category.name || category.title || "",
    name: category.name || category.title || "",
    icon: category.icon || "Rocket",
    description: category.description || "",
    order: category.order || 0,
    createdAt: category.createdAt || new Date(),
    updatedAt: category.updatedAt || new Date(),
    userId: category.userId || ""
  }) as unknown as Category;
});

export const getNotes = cache(async (userId: string): Promise<Note[]> => {
  const db = await getDb();
  const notes = await db.collection("notes").find({ userId }).sort({ pinned: -1, updatedAt: -1 }).toArray();
  return serialize(notes.map(n => ({
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
  }))) as unknown as Note[];
});

export const getProjects = cache(async (userId: string): Promise<Project[]> => {
  const db = await getDb();
  const projects = await db.collection("projects").find({ userId }).sort({ updatedAt: -1 }).toArray();
  return serialize(projects.map(p => ({
    ...p,
    _id: p._id?.toString(),
    id: p._id?.toString() || p.id || "",
    name: p.name || "",
    description: p.description || "",
    status: p.status || "active",
    userId: p.userId || "",
    createdAt: p.createdAt || new Date(),
    updatedAt: p.updatedAt || new Date()
  }))) as unknown as Project[];
});

export const getPeople = cache(async (userId: string): Promise<Person[]> => {
  const db = await getDb();
  const people = await db.collection("people").find({ userId }).sort({ name: 1 }).toArray();
  return serialize(people.map(p => ({
    ...p,
    _id: p._id?.toString(),
    id: p._id?.toString() || p.id || "",
    name: p.name || "",
    type: p.type || "developer",
    links: p.links || [],
    notes: p.notes || "",
    tags: p.tags || [],
    userId: p.userId || "",
    createdAt: p.createdAt || new Date(),
    updatedAt: p.updatedAt || new Date()
  }))) as unknown as Person[];
});

// Dashboard Queries
export const getStats = cache(async (userId: string) => {
  const db = await getDb();
  const [resources, categories, notes, projects, people] = await Promise.all([
    db.collection("resources").countDocuments({ userId }),
    db.collection("categories").countDocuments({ userId }),
    db.collection("notes").countDocuments({ userId }),
    db.collection("projects").countDocuments({ userId }),
    db.collection("people").countDocuments({ userId })
  ]);
  const latestResource = await db.collection("resources").find({ userId }).sort({ createdAt: -1 }).limit(1).toArray();
  return serialize({
    resources,
    categories,
    notes,
    projects,
    people,
    // Backwards compatibility
    totalResources: resources,
    totalCategories: categories,
    latestResourceName: latestResource[0]?.title || latestResource[0]?.name || "None"
  });
});

export const getFavorites = cache(async (userId: string) => {
  const db = await getDb();
  const resources = await db.collection("resources").find({ userId, favorite: true }).limit(6).toArray();
  const notes = await db.collection("notes").find({ userId, pinned: true }).limit(6).toArray();
  
  return serialize({
    resources: resources.map(r => ({
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
    })),
    notes: notes.map(n => ({
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
    }))
  });
});

export const getRecentlyViewed = cache(async (userId: string, limit = 6): Promise<Resource[]> => {
  const db = await getDb();
  const resources = await db.collection("resources").find({ userId, recentlyViewedAt: { $exists: true } }).sort({ recentlyViewedAt: -1 }).limit(limit).toArray();
  return serialize(resources.map(r => ({
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
  }))) as unknown as Resource[];
});

export const getRecentlyAdded = cache(async (userId: string, limit = 6): Promise<Resource[]> => {
  const db = await getDb();
  const resources = await db.collection("resources").find({ userId }).sort({ createdAt: -1 }).limit(limit).toArray();
  return serialize(resources.map(r => ({
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
  }))) as unknown as Resource[];
});

export const getMostUsed = cache(async (userId: string, limit = 6): Promise<Resource[]> => {
  const db = await getDb();
  const resources = await db.collection("resources").find({ userId, useCount: { $gt: 0 } }).sort({ useCount: -1, recentlyUsedAt: -1 }).limit(limit).toArray();
  return serialize(resources.map(r => ({
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
  }))) as unknown as Resource[];
});

export const getProjectById = cache(async (id: string, userId: string): Promise<Project | null> => {
  const db = await getDb();
  const query: Record<string, unknown> = { userId };
  if (ObjectId.isValid(id)) {
    query._id = new ObjectId(id);
  } else {
    query.id = id;
  }
  const project = await db.collection("projects").findOne(query);
  if (!project) return null;
  return serialize({
    ...project,
    _id: project._id?.toString(),
    id: project._id?.toString() || project.id || "",
    name: project.name || "",
    description: project.description || "",
    status: project.status || "active",
    userId: project.userId || "",
    createdAt: project.createdAt || new Date(),
    updatedAt: project.updatedAt || new Date()
  }) as unknown as Project;
});

export const getPersonById = cache(async (id: string, userId: string): Promise<Person | null> => {
  const db = await getDb();
  const query: Record<string, unknown> = { userId };
  if (ObjectId.isValid(id)) {
    query._id = new ObjectId(id);
  } else {
    query.id = id;
  }
  const person = await db.collection("people").findOne(query);
  if (!person) return null;
  return serialize({
    ...person,
    _id: person._id?.toString(),
    id: person._id?.toString() || person.id || "",
    name: person.name || "",
    type: person.type || "developer",
    links: person.links || [],
    notes: person.notes || "",
    tags: person.tags || [],
    userId: person.userId || "",
    createdAt: person.createdAt || new Date(),
    updatedAt: person.updatedAt || new Date()
  }) as unknown as Person;
});
