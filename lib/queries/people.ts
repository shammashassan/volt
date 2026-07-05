import { getDb, serialize } from "@/lib/db";
import { Person } from "@/types";
import { cache } from "react";
import { ObjectId } from "mongodb";

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
