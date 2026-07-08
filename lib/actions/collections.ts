"use server";

import { revalidatePath } from "next/cache";
import clientPromise from "../mongodb";
import { ObjectId } from "mongodb";
import { getSessionUser, getErrorMessage } from "../auth-utils";

export async function addCollectionAction(
  dataOrForm: FormData | {
    slug: string;
    name: string;
    description?: string;
    icon?: string;
    order?: number;
  }
) {
  try {
    const user = await getSessionUser();
    const client = await clientPromise;
    const db = client.db();

    let collection: Record<string, unknown>;

    if (dataOrForm instanceof FormData) {
      const slug = dataOrForm.get("slug") as string;
      const name = dataOrForm.get("name") as string;
      const description = dataOrForm.get("description") as string;
      const icon = dataOrForm.get("icon") as string;
      const order = parseInt(dataOrForm.get("order") as string) || 0;

      collection = {
        slug: slug.toLowerCase().trim(),
        name,
        description,
        icon,
        order,
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } else {
      collection = {
        ...dataOrForm,
        slug: dataOrForm.slug.toLowerCase().trim(),
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    // Check for duplicate slug for this user
    const existing = await db.collection("collections").findOne({
      userId: user.id,
      slug: collection.slug
    });

    if (existing) {
      return { success: false, error: "A collection with this slug already exists." };
    }

    const result = await db.collection("collections").insertOne(collection);
    revalidatePath("/categories");
    revalidatePath("/resources");
    revalidatePath("/explore");
    return { success: true, id: result.insertedId.toString() };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateCollectionAction(idOrSlug: string, data: Record<string, unknown>) {
  try {
    const user = await getSessionUser();
    const client = await clientPromise;
    const db = client.db();

    const updateData: Record<string, unknown> = { ...data, updatedAt: new Date() };
    delete updateData._id;

    if (typeof updateData.order === "string") {
      updateData.order = parseInt(updateData.order) || 0;
    }
    if (typeof updateData.slug === "string") {
      updateData.slug = updateData.slug.toLowerCase().trim();
    }

    const query: any = { userId: user.id };
    if (ObjectId.isValid(idOrSlug)) {
      query._id = new ObjectId(idOrSlug);
    } else {
      query.slug = idOrSlug;
    }

    // If slug is changing, verify no duplicates
    if (updateData.slug) {
      const existing = await db.collection("collections").findOne({
        userId: user.id,
        slug: updateData.slug,
        _id: { $ne: query._id || null }
      });
      if (existing) {
        return { success: false, error: "A collection with this slug already exists." };
      }
    }

    // Get current collection to know if slug changed
    const current = await db.collection("collections").findOne(query);
    if (!current) {
      return { success: false, error: "Collection not found" };
    }

    await db.collection("collections").updateOne(query, { $set: updateData });

    // If slug changed, update all referencing categories
    if (updateData.slug && updateData.slug !== current.slug) {
      await db.collection("categories").updateMany(
        { userId: user.id, collectionId: current.slug },
        { $set: { collectionId: updateData.slug, updatedAt: new Date() } }
      );
    }

    revalidatePath("/categories");
    revalidatePath("/resources");
    revalidatePath("/explore");
    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function deleteCollectionAction(idOrSlug: string) {
  try {
    const user = await getSessionUser();
    const client = await clientPromise;
    const db = client.db();

    const query: Record<string, unknown> = { userId: user.id };
    if (ObjectId.isValid(idOrSlug)) {
      query._id = new ObjectId(idOrSlug);
    } else {
      query.slug = idOrSlug;
    }

    const collectionDoc = await db.collection("collections").findOne(query);
    if (!collectionDoc) {
      return { success: false, error: "Collection not found" };
    }

    // Verify no categories are associated with this collection
    const categoriesCount = await db.collection("categories").countDocuments({
      userId: user.id,
      collectionId: collectionDoc.slug
    });

    if (categoriesCount > 0) {
      return { success: false, error: "Cannot delete a collection that contains categories." };
    }

    await db.collection("collections").deleteOne({ _id: collectionDoc._id });
    revalidatePath("/categories");
    revalidatePath("/resources");
    revalidatePath("/explore");
    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getCollectionsAction() {
  try {
    const user = await getSessionUser();
    const { getCollections } = await import("@/lib/queries/collections");
    const collections = await getCollections(user.id);
    return { success: true, data: collections };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
