import clientPromise from "./mongodb";
import { Resource } from "./data";

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
