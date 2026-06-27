"use server";

import { revalidatePath, updateTag } from "next/cache";
import clientPromise from "../mongodb";
import { ObjectId } from "mongodb";
import { PersonType } from "../types";
import { getSessionUser, getErrorMessage } from "../auth-utils";
import { SearchIndexRepository } from "@/features/search/repositories/search-index.repository";

const searchIndexRepo = new SearchIndexRepository();

export async function addPersonAction(data: {
  name: string;
  type: PersonType;
  links: string[];
  notes?: string;
  tags: string[];
}) {
  try {
    const user = await getSessionUser();
    const client = await clientPromise;
    const db = client.db();

    const person = {
      ...data,
      userId: user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection("people").insertOne(person);

    // Upsert into Search Index
    await searchIndexRepo.upsert({
      userId: user.id,
      title: person.name,
      description: person.notes || "",
      entityType: 'person',
      entityId: result.insertedId.toString()
    });

    revalidatePath("/people");
    updateTag(`explore-body-${user.id}`);
    updateTag(`dashboard-stats-${user.id}`);
    return { success: true, id: result.insertedId.toString() };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updatePersonAction(id: string, data: Record<string, unknown>) {
  try {
    const user = await getSessionUser();
    const client = await clientPromise;
    const db = client.db();

    const updateData: Record<string, unknown> = { ...data, updatedAt: new Date() };
    delete updateData._id;

    const query = ObjectId.isValid(id) ? { _id: new ObjectId(id), userId: user.id } : { id, userId: user.id };

    await db.collection("people").updateOne(query, { $set: updateData });

    // Fetch the updated person to update Search Index
    const updated = await db.collection("people").findOne(query);
    if (updated) {
      await searchIndexRepo.upsert({
        userId: user.id,
        title: updated.name,
        description: updated.notes || "",
        entityType: 'person',
        entityId: id
      });
    }

    revalidatePath("/people");
    updateTag(`explore-body-${user.id}`);
    updateTag(`dashboard-stats-${user.id}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function deletePersonAction(id: string) {
  try {
    const user = await getSessionUser();
    const client = await clientPromise;
    const db = client.db();

    const query = ObjectId.isValid(id) ? { _id: new ObjectId(id), userId: user.id } : { id, userId: user.id };

    await db.collection("people").deleteOne(query);

    // Remove from Search Index
    await searchIndexRepo.remove(id);

    revalidatePath("/people");
    updateTag(`explore-body-${user.id}`);
    updateTag(`dashboard-stats-${user.id}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
