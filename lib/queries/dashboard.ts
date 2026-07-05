import { getDb, serialize } from "@/lib/db";
import { cache } from "react";

export const getStats = cache(async (userId: string) => {
  const db = await getDb();
  const [resources, categories, notes, projects, people] = await Promise.all([
    db.collection("resources").countDocuments({ userId }),
    db.collection("categories").countDocuments({ userId }),
    db.collection("notes").countDocuments({ userId }),
    db.collection("projects").countDocuments({ userId }),
    db.collection("people").countDocuments({ userId })
  ]);
  const latestResource = await db.collection("resources").find({ userId }).sort({ createdAt: -1 }).limit(1).toArray();
  return serialize({
    resources,
    categories,
    notes,
    projects,
    people,
    totalResources: resources,
    totalCategories: categories,
    latestResourceName: latestResource[0]?.title || latestResource[0]?.name || "None"
  });
});

export const getFavorites = cache(async (userId: string) => {
  const db = await getDb();
  const resources = await db.collection("resources").find({ userId, favorite: true }).limit(6).toArray();
  const notes = await db.collection("notes").find({ userId, pinned: true }).limit(6).toArray();

  return serialize({
    resources: resources.map(r => ({
      ...r,
      _id: r._id?.toString(),
      id: r._id?.toString() || r.id || "",
      name: r.title || r.name || "",
      link: r.url || r.link || "",
      category: r.categoryId || r.category || "",
      description: r.description || "",
      featured: r.favorite || r.featured || false,
      logo: r.logo || "",
      order: r.order || 0,
      title: r.title || r.name || "",
      url: r.url || r.link || "",
      categoryId: r.categoryId || r.category || "",
      favorite: r.favorite || r.featured || false,
      tags: r.tags || [],
      projectIds: r.projectIds || [],
      personIds: r.personIds || [],
      useCount: r.useCount || 0,
      status: r.status || "saved",
      type: r.type || "website",
      userId: r.userId || "",
      createdAt: r.createdAt || new Date(),
      updatedAt: r.updatedAt || new Date()
    })),
    notes: notes.map(n => ({
      ...n,
      _id: n._id?.toString(),
      id: n._id?.toString() || n.id || "",
      title: n.title || "",
      content: n.content || "",
      tags: n.tags || [],
      userId: n.userId || "",
      pinned: !!n.pinned,
      relatedResources: n.relatedResources || [],
      relatedProjects: n.relatedProjects || [],
      relatedPeople: n.relatedPeople || [],
      createdAt: n.createdAt || new Date(),
      updatedAt: n.updatedAt || new Date()
    }))
  });
});
