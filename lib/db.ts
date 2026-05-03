import clientPromise from "./mongodb";
import { Resource, Category } from "./data";

export async function getResources(): Promise<Resource[]> {
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
}

export async function getCategories(): Promise<Category[]> {
  const client = await clientPromise;
  const db = client.db();
  const categories = await db.collection("categories").find().toArray();
  return categories.map(c => ({
    id: c.id || c._id.toString(),
    title: c.title,
    icon: c.icon,
    description: c.description
  })) as Category[];
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const client = await clientPromise;
  const db = client.db();
  const category = await db.collection("categories").findOne({ id });
  if (!category) return null;
  return {
    id: category.id,
    title: category.title,
    icon: category.icon,
    description: category.description,
  } as Category;
}
