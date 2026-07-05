import { getDb, serialize } from "@/lib/db";
import { Project } from "@/types";
import { cache } from "react";
import { ObjectId } from "mongodb";

export const getProjects = cache(async (userId: string): Promise<Project[]> => {
  const db = await getDb();
  const projects = await db.collection("projects").find({ userId }).sort({ updatedAt: -1 }).toArray();
  return serialize(projects.map(p => ({
    ...p,
    _id: p._id?.toString(),
    id: p._id?.toString() || p.id || "",
    name: p.name || "",
    description: p.description || "",
    status: p.status || "active",
    userId: p.userId || "",
    createdAt: p.createdAt || new Date(),
    updatedAt: p.updatedAt || new Date()
  }))) as unknown as Project[];
});

export const getProjectById = cache(async (id: string, userId: string): Promise<Project | null> => {
  const db = await getDb();
  const query: Record<string, unknown> = { userId };
  if (ObjectId.isValid(id)) {
    query._id = new ObjectId(id);
  } else {
    query.id = id;
  }
  const project = await db.collection("projects").findOne(query);
  if (!project) return null;
  return serialize({
    ...project,
    _id: project._id?.toString(),
    id: project._id?.toString() || project.id || "",
    name: project.name || "",
    description: project.description || "",
    status: project.status || "active",
    userId: project.userId || "",
    createdAt: project.createdAt || new Date(),
    updatedAt: project.updatedAt || new Date()
  }) as unknown as Project;
});
