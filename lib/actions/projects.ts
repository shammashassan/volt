"use server";

import { revalidatePath, updateTag } from "next/cache";
import clientPromise from "../mongodb";
import { ObjectId } from "mongodb";
import { ProjectStatus } from "../types";
import { getSessionUser, getErrorMessage } from "../auth-utils";
import { getProjects } from "../db";
import { SearchIndexRepository } from "@/features/search/repositories/search-index.repository";

const searchIndexRepo = new SearchIndexRepository();

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

    // Upsert into Search Index
    await searchIndexRepo.upsert({
      userId: user.id,
      title: project.name,
      description: project.description || "",
      entityType: 'project',
      entityId: result.insertedId.toString()
    });

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

    // Fetch the updated project to update Search Index
    const updated = await db.collection("projects").findOne(query);
    if (updated) {
      await searchIndexRepo.upsert({
        userId: user.id,
        title: updated.name,
        description: updated.description || "",
        entityType: 'project',
        entityId: id
      });
    }

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

    // Remove from Search Index
    await searchIndexRepo.remove(id);

    revalidatePath("/projects");
    updateTag(`explore-body-${user.id}`);
    updateTag(`dashboard-stats-${user.id}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getProjectsAction() {
  try {
    const user = await getSessionUser();
    const projects = await getProjects(user.id);
    return { success: true, data: projects };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
