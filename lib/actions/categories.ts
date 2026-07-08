"use server";

import { revalidatePath, updateTag } from "next/cache";
import clientPromise from "../mongodb";
import { ObjectId } from "mongodb";
import { getSessionUser, getErrorMessage } from "../auth-utils";
import { getDb } from "../db";
import { getCategories } from "@/lib/queries/categories";

export async function addCategoryAction(
  dataOrForm: FormData | {
    slug: string;
    name: string;
    description?: string;
    icon?: string;
    order?: number;
    collectionId: string;
  }
) {
  try {
    const user = await getSessionUser();
    const client = await clientPromise;
    const db = client.db();

    let category: Record<string, unknown>;

    if (dataOrForm instanceof FormData) {
      const slug = dataOrForm.get("slug") as string;
      const name = dataOrForm.get("name") as string;
      const description = dataOrForm.get("description") as string;
      const icon = dataOrForm.get("icon") as string;
      const order = parseInt(dataOrForm.get("order") as string) || 0;
      const collectionId = dataOrForm.get("collectionId") as string;

      category = {
        slug: slug.toLowerCase().trim(),
        name,
        description,
        icon,
        order,
        collectionId,
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } else {
      category = {
        ...dataOrForm,
        slug: dataOrForm.slug.toLowerCase().trim(),
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    // Check for duplicate category slug for this user
    const existing = await db.collection("categories").findOne({
      userId: user.id,
      slug: category.slug
    });

    if (existing) {
      return { success: false, error: "A category with this slug already exists." };
    }

    const result = await db.collection("categories").insertOne(category);
    revalidatePath("/explore");
    revalidatePath("/categories");
    revalidatePath("/resources");
    updateTag(`explore-body-${user.id}`);
    updateTag(`dashboard-stats-${user.id}`);
    return { success: true, id: result.insertedId.toString() };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateCategoryAction(idOrSlug: string, data: Record<string, unknown>) {
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
      const existing = await db.collection("categories").findOne({
        userId: user.id,
        slug: updateData.slug,
        _id: { $ne: query._id || null }
      });
      if (existing) {
        return { success: false, error: "A category with this slug already exists." };
      }
    }

    // Get current category to know if slug changed
    const current = await db.collection("categories").findOne(query);
    if (!current) {
      return { success: false, error: "Category not found" };
    }

    await db.collection("categories").updateOne(query, { $set: updateData });

    // If slug changed, update all referencing resources
    if (updateData.slug && updateData.slug !== current.slug) {
      await db.collection("resources").updateMany(
        { userId: user.id, categoryId: current.slug },
        { $set: { categoryId: updateData.slug, updatedAt: new Date() } }
      );
    }

    revalidatePath("/explore");
    revalidatePath("/categories");
    revalidatePath("/resources");
    updateTag(`explore-body-${user.id}`);
    updateTag(`dashboard-stats-${user.id}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function deleteCategoryAction(idOrSlug: string) {
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

    const categoryDoc = await db.collection("categories").findOne(query);
    if (!categoryDoc) {
      return { success: false, error: "Category not found" };
    }

    // Check if category has resources referencing it by categoryId (or legacy category field)
    const resourcesCount = await db.collection("resources").countDocuments({ 
      userId: user.id, 
      $or: [
        { categoryId: categoryDoc.slug },
        { category: categoryDoc.slug }
      ]
    });

    if (resourcesCount > 0) {
      return { success: false, error: "Cannot delete category that contains resources." };
    }

    await db.collection("categories").deleteOne({ _id: categoryDoc._id });
    revalidatePath("/explore");
    revalidatePath("/categories");
    revalidatePath("/resources");
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
            _id: "$categoryId",
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
      const count = cat.slug ? (countMap.get(cat.slug) || 0) : 0;
      return {
        ...cat,
        resourceCount: count
      };
    });

    return { success: true, data: categoriesWithCounts };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
