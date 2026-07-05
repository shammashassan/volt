"use server";

import { revalidatePath, updateTag } from "next/cache";
import clientPromise from "../mongodb";
import { ObjectId } from "mongodb";
import { getSessionUser, getErrorMessage } from "../auth-utils";
import { SearchIndexRepository } from "@/lib/repositories/search-index.repository";

const searchIndexRepo = new SearchIndexRepository();

export async function addNoteAction(data: {
  title: string;
  content: string;
  tags: string[];
  pinned: boolean;
  relatedResources: string[];
  relatedProjects: string[];
  relatedPeople: string[];
  fontSize?: string;
  formatting?: string[];
}) {
  try {
    const user = await getSessionUser();
    const client = await clientPromise;
    const db = client.db();

    const note = {
      ...data,
      userId: user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection("notes").insertOne(note);

    // Upsert into Search Index
    await searchIndexRepo.upsert({
      userId: user.id,
      title: data.title,
      description: data.content,
      entityType: 'note',
      entityId: result.insertedId.toString()
    });

    revalidatePath("/notes");
    updateTag(`explore-body-${user.id}`);
    updateTag(`dashboard-stats-${user.id}`);
    return { success: true, id: result.insertedId.toString() };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateNoteAction(id: string, data: Record<string, unknown>) {
  try {
    const user = await getSessionUser();
    const client = await clientPromise;
    const db = client.db();

    const updateData: Record<string, unknown> = { ...data, updatedAt: new Date() };
    delete updateData._id;

    const query = ObjectId.isValid(id) ? { _id: new ObjectId(id), userId: user.id } : { id, userId: user.id };

    await db.collection("notes").updateOne(query, { $set: updateData });

    // Fetch the updated note to update Search Index
    const updatedNote = await db.collection("notes").findOne(query);
    if (updatedNote) {
      await searchIndexRepo.upsert({
        userId: user.id,
        title: updatedNote.title || "",
        description: updatedNote.content || "",
        entityType: 'note',
        entityId: id
      });
    }

    revalidatePath("/notes");
    updateTag(`explore-body-${user.id}`);
    updateTag(`dashboard-stats-${user.id}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function deleteNoteAction(id: string) {
  try {
    const user = await getSessionUser();
    const client = await clientPromise;
    const db = client.db();

    const query = ObjectId.isValid(id) ? { _id: new ObjectId(id), userId: user.id } : { id, userId: user.id };

    await db.collection("notes").deleteOne(query);

    // Remove from Search Index
    await searchIndexRepo.remove(id);

    revalidatePath("/notes");
    updateTag(`explore-body-${user.id}`);
    updateTag(`dashboard-stats-${user.id}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

