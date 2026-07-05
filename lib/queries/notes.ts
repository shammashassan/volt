import { getDb, serialize, mapNoteDoc } from "@/lib/db";
import { Note } from "@/types";
import { cache } from "react";
import { ObjectId } from "mongodb";

export const getNotes = cache(async (userId: string): Promise<Note[]> => {
  const db = await getDb();
  const notes = await db.collection("notes").find({ userId }).sort({ pinned: -1, updatedAt: -1 }).toArray();
  return serialize(notes.map(mapNoteDoc)) as unknown as Note[];
});

export const getNotesByProjectId = cache(async (projectId: string, userId: string): Promise<Note[]> => {
  const db = await getDb();
  const notes = await db.collection("notes").find({ userId, relatedProjects: projectId }).sort({ pinned: -1, updatedAt: -1 }).toArray();
  return serialize(notes.map(mapNoteDoc)) as unknown as Note[];
});

export const getNotesByPersonId = cache(async (personId: string, userId: string): Promise<Note[]> => {
  const db = await getDb();
  const notes = await db.collection("notes").find({ userId, relatedPeople: personId }).sort({ pinned: -1, updatedAt: -1 }).toArray();
  return serialize(notes.map(mapNoteDoc)) as unknown as Note[];
});
