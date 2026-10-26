import { Category, Resource, Note, Project, Person } from "@/types"
import { getDb, db } from "./db/client"
export { getDb, db }

// Helper function to recursively convert ObjectId, Date and other objects with custom prototypes/methods into plain serializable values.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function serialize<T>(obj: T): any {
  if (obj === null || obj === undefined) {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(serialize)
  }

  if (obj instanceof Date) {
    return obj.toISOString()
  }

  if (typeof obj === "object") {
    // MongoDB ObjectId has toHexString
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof (obj as any).toHexString === "function") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (obj as any).toHexString()
    }

    // Fallback checking for ObjectId-like objects
    if (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (obj as any)._bsontype === "ObjectID" ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (obj as any).constructor?.name === "ObjectID" ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (obj as any).constructor?.name === "ObjectId"
    ) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (obj as any).toString()
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = {}
    for (const key of Object.keys(obj)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      result[key] = serialize((obj as any)[key])
    }
    return result
  }

  return obj
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapResourceDoc(r: any): Resource {
  return {
    ...r,
    _id: r._id?.toString(),
    id: r._id?.toString() || r.id || "",
    title: r.title || r.name || "",
    url: r.url || r.link || "",
    description: r.description || "",
    categoryId: r.categoryId || r.category || "",
    favorite: r.favorite || r.featured || false,
    order: r.order || 0,
    tags: r.tags || [],
    projectIds: r.projectIds || [],
    personIds: r.personIds || [],
    useCount: r.useCount || 0,
    type: r.type || "website",
    userId: r.userId || "",
    createdAt: r.createdAt || new Date(),
    updatedAt: r.updatedAt || new Date(),
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    updatedAt: n.updatedAt || new Date(),
  }
}
