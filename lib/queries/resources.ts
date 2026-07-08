import { getDb, serialize, mapResourceDoc } from "@/lib/db";
import { Resource } from "@/types";
import { cache } from "react";
import { ObjectId } from "mongodb";

export const getResources = cache(async (userId: string): Promise<Resource[]> => {
  const db = await getDb();
  const resources = await db.collection("resources").find({ userId }).sort({ order: 1, createdAt: -1 }).toArray();
  return serialize(resources.map(mapResourceDoc)) as unknown as Resource[];
});

export const getResourcesByCategoryId = cache(async (categoryId: string, userId: string): Promise<Resource[]> => {
  const db = await getDb();
  const query = {
    userId,
    categoryId
  };
  const resources = await db.collection("resources").find(query).sort({ order: 1, createdAt: -1 }).toArray();
  return serialize(resources.map(mapResourceDoc)) as unknown as Resource[];
});

export const getResourcesByProjectId = cache(async (projectId: string, userId: string): Promise<Resource[]> => {
  const db = await getDb();
  const resources = await db.collection("resources").find({ userId, projectIds: projectId }).sort({ order: 1, createdAt: -1 }).toArray();
  return serialize(resources.map(mapResourceDoc)) as unknown as Resource[];
});

export const getResourcesByPersonId = cache(async (personId: string, userId: string): Promise<Resource[]> => {
  const db = await getDb();
  const resources = await db.collection("resources").find({ userId, personIds: personId }).sort({ order: 1, createdAt: -1 }).toArray();
  return serialize(resources.map(mapResourceDoc)) as unknown as Resource[];
});

export const getRecentlyViewed = cache(async (userId: string, limit = 6): Promise<Resource[]> => {
  const db = await getDb();
  const resources = await db.collection("resources").find({ userId, recentlyViewedAt: { $exists: true } }).sort({ recentlyViewedAt: -1 }).limit(limit).toArray();
  return serialize(resources.map(mapResourceDoc)) as unknown as Resource[];
});

export const getRecentlyAdded = cache(async (userId: string, limit = 6): Promise<Resource[]> => {
  const db = await getDb();
  const resources = await db.collection("resources").find({ userId }).sort({ createdAt: -1 }).limit(limit).toArray();
  return serialize(resources.map(mapResourceDoc)) as unknown as Resource[];
});

export const getMostUsed = cache(async (userId: string, limit = 6): Promise<Resource[]> => {
  const db = await getDb();
  const resources = await db.collection("resources").find({ userId, useCount: { $gt: 0 } }).sort({ useCount: -1, recentlyUsedAt: -1 }).limit(limit).toArray();
  return serialize(resources.map(mapResourceDoc)) as unknown as Resource[];
});

export const getInboxCount = cache(async (userId: string): Promise<number> => {
  const db = await getDb();
  return db.collection("resources").countDocuments({
    userId,
    $or: [
      { categoryId: { $exists: false } },
      { categoryId: null },
      { categoryId: "" },
    ],
    $nor: [
      { category: { $exists: true, $ne: "" } },
    ],
  });
});

export const getRecentlyValuable = cache(
  async (userId: string, limit = 5): Promise<Resource[]> => {
    const db = await getDb();
    const resources = await db
      .collection("resources")
      .find({ userId, useCount: { $gt: 0 } })
      .sort({ useCount: -1, recentlyUsedAt: -1 })
      .limit(limit)
      .toArray();

    return serialize(resources.map(mapResourceDoc)) as unknown as Resource[];
  }
);

export const getRecommendedResources = cache(
  async (userId: string, limit = 3): Promise<Resource[]> => {
    const db = await getDb();
    const resources = await db
      .collection("resources")
      .find({
        userId,
        recentlyViewedAt: { $exists: false }
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    return serialize(resources.map(mapResourceDoc)) as unknown as Resource[];
  }
);

export const getSpotlightResource = cache(
  async (userId: string): Promise<Resource | null> => {
    const db = await getDb();

    let doc = await db
      .collection("resources")
      .find({ userId, favorite: true, useCount: { $gt: 0 } })
      .sort({ useCount: -1 })
      .limit(1)
      .next();

    if (!doc) {
      doc = await db
        .collection("resources")
        .find({ userId, useCount: { $gt: 0 } })
        .sort({ useCount: -1 })
        .limit(1)
        .next();
    }

    if (!doc) {
      doc = await db
        .collection("resources")
        .find({ userId, favorite: true })
        .sort({ createdAt: -1 })
        .limit(1)
        .next();
    }

    if (!doc) return null;
    return serialize(mapResourceDoc(doc)) as unknown as Resource;
  }
);
