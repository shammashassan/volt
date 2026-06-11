"use server";

import { revalidatePath, updateTag } from "next/cache";
import clientPromise from "../mongodb";
import { ObjectId } from "mongodb";
import { getSessionUser, getErrorMessage } from "../auth-utils";

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
    revalidatePath("/notes");
    updateTag(`explore-body-${user.id}`);
    updateTag(`dashboard-stats-${user.id}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
