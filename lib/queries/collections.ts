import { getDb, serialize } from "@/lib/db";
import { Collection } from "@/types";
import { ObjectId } from "mongodb";
import { cache } from "react";

export const getCollections = cache(async (userId: string): Promise<Collection[]> => {
  const db = await getDb();
  const collections = await db.collection("collections").find({ userId }).sort({ order: 1, name: 1 }).toArray();
  return serialize(collections.map(c => ({
    ...c,
    _id: c._id?.toString(),
    slug: c.slug || "",
    name: c.name || "",
    description: c.description || "",
    icon: c.icon || "Code",
    order: c.order || 0,
    createdAt: c.createdAt || new Date(),
    updatedAt: c.updatedAt || new Date(),
    userId: c.userId || ""
  }))) as unknown as Collection[];
});

export const getCollectionById = cache(async (id: string, userId: string): Promise<Collection | null> => {
  const db = await getDb();
  const query: Record<string, unknown> = { userId };
  if (ObjectId.isValid(id)) {
    query._id = new ObjectId(id);
  } else {
    query.slug = id;
  }
  const collection = await db.collection("collections").findOne(query);
  if (!collection) return null;
  return serialize({
    ...collection,
    _id: collection._id?.toString(),
    slug: collection.slug || "",
    name: collection.name || "",
    description: collection.description || "",
    icon: collection.icon || "Code",
    order: collection.order || 0,
    createdAt: collection.createdAt || new Date(),
    updatedAt: collection.updatedAt || new Date(),
    userId: collection.userId || ""
  }) as unknown as Collection;
});
