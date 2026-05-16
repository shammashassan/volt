import clientPromise from "./mongodb";
import { Resource, Category } from "./data";
import { unstable_cache } from "next/cache";
import { cache } from "react";

// Deduplicate DB connection and basic fetches within a single request
export const getResources = cache(unstable_cache(
  async (): Promise<Resource[]> => {
    const client = await clientPromise;
    const db = client.db();
    const resources = await db.collection("resources").find().sort({ order: 1, createdAt: -1 }).toArray();
    return resources.map(r => ({
      name: r.name,
      link: r.link,
      description: r.description,
      category: r.category,
      featured: r.featured,
      logo: r.logo,
      order: r.order || 0
    })) as Resource[];
  },
  ["resources"],
  { revalidate: 3600, tags: ["resources"] }
));

export const getFeaturedResources = cache(unstable_cache(
  async (): Promise<Resource[]> => {
    const client = await clientPromise;
    const db = client.db();
    const resources = await db.collection("resources").find({ featured: true }).sort({ order: 1, createdAt: -1 }).toArray();
    return resources.map(r => ({
      name: r.name,
      link: r.link,
      description: r.description,
      category: r.category,
      featured: r.featured,
      logo: r.logo,
      order: r.order || 0
    })) as Resource[];
  },
  ["resources-featured"],
  { revalidate: 3600, tags: ["resources"] }
));

export const getCategories = cache(unstable_cache(
  async (): Promise<Category[]> => {
    const client = await clientPromise;
    const db = client.db();
    const categories = await db.collection("categories").find().sort({ order: 1, title: 1 }).toArray();
    return categories.map(c => ({
      id: c.id || c._id.toString(),
      title: c.title,
      icon: c.icon,
      description: c.description,
      order: c.order || 0
    })) as Category[];
  },
  ["categories"],
  { revalidate: 3600, tags: ["categories"] }
));

export const getCategoryById = cache(async (id: string): Promise<Category | null> => {
  const client = await clientPromise;
  const db = client.db();
  const category = await db.collection("categories").findOne({ id });
  if (!category) return null;
  return {
    id: category.id || category._id.toString(),
    title: category.title,
    icon: category.icon,
    description: category.description,
    order: category.order || 0
  } as Category;
});

export const getStats = cache(async () => {
  const client = await clientPromise;
  const db = client.db();
  const [totalResources, totalCategories] = await Promise.all([
    db.collection("resources").countDocuments(),
    db.collection("categories").countDocuments()
  ]);
  const latestResource = await db.collection("resources").find().sort({ createdAt: -1 }).limit(1).toArray();
  
  return {
    totalResources,
    totalCategories,
    latestResourceName: latestResource[0]?.name || "None"
  };
});
