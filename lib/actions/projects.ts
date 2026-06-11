"use server";

import { revalidatePath, updateTag } from "next/cache";
import clientPromise from "../mongodb";
import { ObjectId } from "mongodb";
import { ProjectStatus } from "../types";
import { getSessionUser, getErrorMessage } from "../auth-utils";

export async function addProjectAction(data: {
  name: string;
  description?: string;
  url?: string;
  status: ProjectStatus;
}) {
  try {
    const user = await getSessionUser();
    const client = await clientPromise;
    const db = client.db();

    const project = {
      ...data,
      userId: user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection("projects").insertOne(project);
    revalidatePath("/projects");
    updateTag(`explore-body-${user.id}`);
    updateTag(`dashboard-stats-${user.id}`);
    return { success: true, id: result.insertedId.toString() };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateProjectAction(id: string, data: Record<string, unknown>) {
  try {
    const user = await getSessionUser();
    const client = await clientPromise;
    const db = client.db();

    const updateData: Record<string, unknown> = { ...data, updatedAt: new Date() };
    delete updateData._id;

    const query = ObjectId.isValid(id) ? { _id: new ObjectId(id), userId: user.id } : { id, userId: user.id };

    await db.collection("projects").updateOne(query, { $set: updateData });
    revalidatePath("/projects");
    updateTag(`explore-body-${user.id}`);
    updateTag(`dashboard-stats-${user.id}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function deleteProjectAction(id: string) {
  try {
    const user = await getSessionUser();
    const client = await clientPromise;
    const db = client.db();

    const query = ObjectId.isValid(id) ? { _id: new ObjectId(id), userId: user.id } : { id, userId: user.id };

    await db.collection("projects").deleteOne(query);
    revalidatePath("/projects");
    updateTag(`explore-body-${user.id}`);
    updateTag(`dashboard-stats-${user.id}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
