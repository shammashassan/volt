"use server";

import { getDb, serialize } from "../db";
import { getSessionUser, getErrorMessage } from "../auth-utils";
import type { Resource, Note, Project, Person, Category } from "../types";

export async function searchAction(query: string) {
  console.log("[server] searchAction called with query:", query);
  try {
    const user = await getSessionUser();
    const db = await getDb();
    const userId = user.id;
    console.log("[server] searchAction authenticated user:", userId);

    const mapId = <T extends object>(arr: (T & { _id?: { toString(): string } })[]): (T & { id: string })[] =>
    arr.map(item => ({ ...item, id: item._id?.toString() ?? "" })) as (T & { id: string })[];

    if (!query.trim()) {
      console.log("[server] searchAction returning empty/recents path");
      // Return recents if empty query
      const [resources, notes, projects, people] = await Promise.all([
        db.collection("resources").find({ userId }).sort({ updatedAt: -1 }).limit(10).toArray(),
        db.collection("notes").find({ userId }).sort({ updatedAt: -1 }).limit(10).toArray(),
        db.collection("projects").find({ userId }).sort({ updatedAt: -1 }).limit(5).toArray(),
        db.collection("people").find({ userId }).sort({ updatedAt: -1 }).limit(5).toArray()
      ]);

      return {
        success: true,
        data: serialize({
          resources: mapId<Resource>(resources as any),
          notes: mapId<Note>(notes as any),
          projects: mapId<Project>(projects as any),
          people: mapId<Person>(people as any),
          categories: [] as Category[]
        })
      };
    }

    // Escape special regex characters to prevent syntax errors (e.g. on backslashes)
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const searchRegex = new RegExp(escapedQuery.trim(), "i");

    console.log("[server] executing regex search queries...");
    const [resources, notes, projects, people, categories] = await Promise.all([
      db.collection("resources").find({
        userId,
        $or: [
          { title: searchRegex },
          { name: searchRegex },
          { tags: searchRegex },
          { description: searchRegex }
        ]
      }).limit(20).toArray(),
      db.collection("notes").find({
        userId,
        $or: [
          { title: searchRegex },
          { content: searchRegex }
        ]
      }).limit(10).toArray(),
      db.collection("projects").find({
        userId,
        name: searchRegex
      }).limit(10).toArray(),
      db.collection("people").find({
        userId,
        name: searchRegex
      }).limit(10).toArray(),
      db.collection("categories").find({
        userId,
        $or: [
          { name: searchRegex },
          { title: searchRegex }
        ]
      }).limit(10).toArray()
    ]);

    console.log("[server] regex search queries completed. Counts:", {
      resources: resources.length,
      notes: notes.length,
      projects: projects.length,
      people: people.length,
      categories: categories.length
    });

    return {
      success: true,
      data: serialize({
        resources: mapId<Resource>(resources as any),
        notes: mapId<Note>(notes as any),
        projects: mapId<Project>(projects as any),
        people: mapId<Person>(people as any),
        categories: categories.map(cat => ({
          ...cat,
          _id: cat._id?.toString() ?? "",
          id: cat.id || (cat._id?.toString() ?? "")
        }))
      })
    };
  } catch (error) {
    console.error("[server] searchAction error caught:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

