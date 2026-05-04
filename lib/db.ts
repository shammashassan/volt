import clientPromise from "./mongodb";
import { Resource, Category } from "./data";
import { unstable_cache } from "next/cache";

export const getResources = unstable_cache(
  async (): Promise<Resource[]> => {
    const client = await clientPromise;
    const db = client.db();
    const resources = await db.collection("resources").find().sort({ createdAt: -1 }).toArray();
    return resources.map(r => ({
      name: r.name,
      link: r.link,
      description: r.description,
      category: r.category,
      featured: r.featured,
      logo: r.logo
    })) as Resource[];
  },
  ["resources"],
  { revalidate: 3600, tags: ["resources"] }
);

export const getCategories = unstable_cache(
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
);

export async function getCategoryById(id: string): Promise<Category | null> {
  const categories = await getCategories();
  return categories.find(c => c.id === id) || null;
}
