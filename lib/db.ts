import { Category, Resource, Note, Project, Person } from "@/types"
import { getDb, db } from "./db/client"
export { getDb, db }

interface ObjectIdLike {
  toHexString?: () => string
  _bsontype?: string
  constructor?: { name?: string }
  toString: () => string
}

// Helper function to recursively convert ObjectId, Date and other objects with custom prototypes/methods into plain serializable values.
export function serialize<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(serialize) as unknown as T
  }

  if (obj instanceof Date) {
    return obj.toISOString() as unknown as T
  }

  if (typeof obj === "object") {
    const candidate = obj as unknown as ObjectIdLike
    // MongoDB ObjectId has toHexString
    if (typeof candidate.toHexString === "function") {
      return candidate.toHexString() as unknown as T
    }

    // Fallback checking for ObjectId-like objects
    if (
      candidate._bsontype === "ObjectID" ||
      candidate.constructor?.name === "ObjectID" ||
      candidate.constructor?.name === "ObjectId"
    ) {
      return candidate.toString() as unknown as T
    }

    const dict = obj as Record<string, unknown>
    const result: Record<string, unknown> = {}
    for (const key of Object.keys(dict)) {
      result[key] = serialize(dict[key])
    }
    return result as T
  }

  return obj
}

export function mapResourceDoc(r: Record<string, unknown>): Resource {
  return {
    ...r,
    _id: r._id ? String(r._id) : undefined,
    id: (r._id ? String(r._id) : "") || (typeof r.id === "string" ? r.id : ""),
    title: (typeof r.title === "string" ? r.title : "") || (typeof r.name === "string" ? r.name : ""),
    url: (typeof r.url === "string" ? r.url : "") || (typeof r.link === "string" ? r.link : ""),
    description: typeof r.description === "string" ? r.description : "",
    categoryId: (typeof r.categoryId === "string" ? r.categoryId : "") || (typeof r.category === "string" ? r.category : ""),
    favorite: Boolean(r.favorite || r.featured),
    order: typeof r.order === "number" ? r.order : 0,
    tags: Array.isArray(r.tags) ? (r.tags as string[]) : [],
    projectIds: Array.isArray(r.projectIds) ? (r.projectIds as string[]) : [],
    personIds: Array.isArray(r.personIds) ? (r.personIds as string[]) : [],
    useCount: typeof r.useCount === "number" ? r.useCount : 0,
    type: (typeof r.type === "string" ? r.type : "website") as Resource["type"],
    userId: typeof r.userId === "string" ? r.userId : "",
    createdAt: r.createdAt instanceof Date ? r.createdAt : new Date(),
    updatedAt: r.updatedAt instanceof Date ? r.updatedAt : new Date(),
  }
}

export function mapNoteDoc(n: Record<string, unknown>): Note {
  return {
    ...n,
    _id: n._id ? String(n._id) : undefined,
    id: (n._id ? String(n._id) : "") || (typeof n.id === "string" ? n.id : ""),
    title: typeof n.title === "string" ? n.title : "",
    content: typeof n.content === "string" ? n.content : "",
    tags: Array.isArray(n.tags) ? (n.tags as string[]) : [],
    userId: typeof n.userId === "string" ? n.userId : "",
    pinned: Boolean(n.pinned),
    relatedResources: Array.isArray(n.relatedResources) ? (n.relatedResources as string[]) : [],
    relatedProjects: Array.isArray(n.relatedProjects) ? (n.relatedProjects as string[]) : [],
    relatedPeople: Array.isArray(n.relatedPeople) ? (n.relatedPeople as string[]) : [],
    createdAt: n.createdAt instanceof Date ? n.createdAt : new Date(),
    updatedAt: n.updatedAt instanceof Date ? n.updatedAt : new Date(),
  }
}
