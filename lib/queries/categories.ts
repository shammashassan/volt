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
    slug: c.slug || "",
    icon: c.icon || "Rocket",
    description: c.description || "",
    order: c.order || 0,
    name: c.name || "",
    collectionId: c.collectionId || "",
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

  return categories.map(cat => {
    const count = cat.slug ? (countMap.get(cat.slug) || 0) : 0;
    return {
      ...cat,
      resourceCount: count
    };
  });
});

export const getCategoryById = cache(async (idOrSlug: string, userId: string): Promise<Category | null> => {
  const db = await getDb();
  const query: Record<string, unknown> = { userId };
  if (ObjectId.isValid(idOrSlug)) {
    query._id = new ObjectId(idOrSlug);
  } else {
    query.slug = idOrSlug;
  }
  const category = await db.collection("categories").findOne(query);
  if (!category) return null;
  return serialize({
    ...category,
    _id: category._id?.toString(),
    slug: category.slug || "",
    name: category.name || "",
    icon: category.icon || "Rocket",
    description: category.description || "",
    order: category.order || 0,
    collectionId: category.collectionId || "",
    createdAt: category.createdAt || new Date(),
    updatedAt: category.updatedAt || new Date(),
    userId: category.userId || ""
  }) as unknown as Category;
});
