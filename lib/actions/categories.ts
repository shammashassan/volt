"use server";

import { revalidatePath, updateTag } from "next/cache";
import clientPromise from "../mongodb";
import { ObjectId } from "mongodb";
import { getSessionUser, getErrorMessage } from "../auth-utils";
import { getDb } from "../db";
import { getCategories } from "@/lib/queries/categories";

export async function addCategoryAction(
  dataOrForm: FormData | {
    name: string;
    description?: string;
    color?: string;
    icon?: string;
  }
) {
  try {
    const user = await getSessionUser();
    const client = await clientPromise;
    const db = client.db();

    let category: Record<string, unknown>;

    if (dataOrForm instanceof FormData) {
      const id = dataOrForm.get("id") as string;
      const title = dataOrForm.get("title") as string;
      const description = dataOrForm.get("description") as string;
      const icon = dataOrForm.get("icon") as string;
      const order = parseInt(dataOrForm.get("order") as string) || 0;

      category = {
        name: title,
        description,
        icon,
        color: "",
        order,
        id, // For backward compatibility
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } else {
      category = {
        ...dataOrForm,
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    const result = await db.collection("categories").insertOne(category);
    revalidatePath("/explore");
    revalidatePath("/categories");
    updateTag(`explore-body-${user.id}`);
    updateTag(`dashboard-stats-${user.id}`);
    return { success: true, id: result.insertedId.toString() };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateCategoryAction(idOrOldId: string, data: Record<string, unknown>) {
  try {
    const user = await getSessionUser();
    const client = await clientPromise;
    const db = client.db();

    const updateData: Record<string, unknown> = { ...data, updatedAt: new Date() };
    delete updateData._id;

    if (updateData.title) {
      updateData.name = updateData.title;
    }

    const query: Record<string, unknown> = { userId: user.id };
    if (ObjectId.isValid(idOrOldId)) {
      query._id = new ObjectId(idOrOldId);
    } else {
      query.id = idOrOldId;
    }

    await db.collection("categories").updateOne(query, { $set: updateData });
    revalidatePath("/explore");
    revalidatePath("/categories");
    revalidatePath(`/categories/${idOrOldId}`);
    updateTag(`explore-body-${user.id}`);
    updateTag(`dashboard-stats-${user.id}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function deleteCategoryAction(idOrOldId: string) {
  try {
    const user = await getSessionUser();
    const client = await clientPromise;
    const db = client.db();

    const query: Record<string, unknown> = { userId: user.id };
    if (ObjectId.isValid(idOrOldId)) {
      query._id = new ObjectId(idOrOldId);
    } else {
      query.id = idOrOldId;
    }

    const categoryDoc = await db.collection("categories").findOne(query);
    if (!categoryDoc) {
      return { success: false, error: "Category not found" };
    }

    const slugId = categoryDoc.id || "";
    const oidStr = categoryDoc._id.toString();

    // Check if category has resources referencing it by either slug or _id
    const categoryMatchQuery = {
      $or: [
        { category: slugId },
        { category: oidStr },
        { categoryId: slugId },
        { categoryId: oidStr }
      ].filter(q => Object.values(q)[0] !== "")
    };

    // Check if category has resources
    const resourcesCount = await db.collection("resources").countDocuments({ 
      userId: user.id, 
      ...categoryMatchQuery 
    });
    if (resourcesCount > 0) {
      return { success: false, error: "Cannot delete category that contains resources" };
    }

    await db.collection("categories").deleteOne({ _id: categoryDoc._id });
    revalidatePath("/explore");
    revalidatePath("/categories");
    updateTag(`explore-body-${user.id}`);
    updateTag(`dashboard-stats-${user.id}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// Server Action replacement for GET /api/categories
export async function getCategoriesAction() {
  try {
    const user = await getSessionUser();
    const db = await getDb();
    
    const [categories, counts] = await Promise.all([
      getCategories(user.id),
      db.collection("resources").aggregate([
        { $match: { userId: user.id } },
        {
          $group: {
            _id: { $ifNull: [ "$categoryId", "$category" ] },
            count: { $sum: 1 }
          }
        }
      ]).toArray()
    ]);

    const countMap = new Map<string, number>();
    counts.forEach((c: any) => {
      const idStr = c._id?.toString() || "";
      countMap.set(idStr, c.count);
    });

    const categoriesWithCounts = categories.map(cat => {
      const idCount = cat.id ? (countMap.get(cat.id) || 0) : 0;
      const oidCount = (cat as any)._id ? (countMap.get((cat as any)._id) || 0) : 0;
      return {
        ...cat,
        resourceCount: idCount + oidCount
      };
    });

    return { success: true, data: categoriesWithCounts };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
