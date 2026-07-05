import { getDb, serialize } from "@/lib/db";
import { Category } from "@/types";
import { ObjectId } from "mongodb";
import { cache } from "react";

export const getCategories = cache(async (userId: string): Promise<Category[]> => {
  const db = await getDb();
  const categories = await db.collection("categories").find({ userId }).sort({ order: 1, name: 1 }).toArray();
  return serialize(categories.map(c => ({
    ...c,
    _id: c._id?.toString(),
    id: c.id || c._id?.toString() || "",
    title: c.name || c.title || "",
    icon: c.icon || "Rocket",
    description: c.description || "",
    order: c.order || 0,
    name: c.name || c.title || "",
    createdAt: c.createdAt || new Date(),
    updatedAt: c.updatedAt || new Date(),
    userId: c.userId || ""
  }))) as unknown as Category[];
});

export const getCategoriesWithCounts = cache(async (userId: string) => {
  const db = await getDb();
  const [categories, counts] = await Promise.all([
    getCategories(userId),
    db.collection("resources").aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: { $ifNull: ["$categoryId", "$category"] },
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

  return categories.map(cat => {
    const idCount = cat.id ? (countMap.get(cat.id) || 0) : 0;
    const oidCount = (cat as any)._id ? (countMap.get((cat as any)._id) || 0) : 0;
    return {
      ...cat,
      resourceCount: idCount + oidCount
    };
  });
});

export const getCategoryById = cache(async (id: string, userId: string): Promise<Category | null> => {
  const db = await getDb();
  const query: Record<string, unknown> = { userId };
  if (ObjectId.isValid(id)) {
    query._id = new ObjectId(id);
  } else {
    query.id = id;
  }
  const category = await db.collection("categories").findOne(query);
  if (!category) return null;
  return serialize({
    ...category,
    _id: category._id?.toString(),
    id: category.id || category._id?.toString() || "",
    title: category.name || category.title || "",
    name: category.name || category.title || "",
    icon: category.icon || "Rocket",
    description: category.description || "",
    order: category.order || 0,
    createdAt: category.createdAt || new Date(),
    updatedAt: category.updatedAt || new Date(),
    userId: category.userId || ""
  }) as unknown as Category;
});
