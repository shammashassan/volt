"use server";

import { getDb, serialize } from "../db";
import { getSessionUser, getErrorMessage } from "../auth-utils";
import type { Resource, Note, Project, Person, Category } from "../types";
import { ObjectId } from "mongodb";

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

    console.log("[server] executing search against search_index...");
    const searchResults = await db.collection("search_index").find({
      userId,
      $or: [
        { title: searchRegex },
        { description: searchRegex }
      ],
      deletedAt: { $exists: false }
    }).limit(50).toArray();

    // Group matched IDs by entityType
    const entityIdsByType: Record<string, ObjectId[]> = {
      resource: [],
      note: [],
      project: [],
      person: []
    };

    for (const entry of searchResults) {
      if (entry.entityId && ObjectId.isValid(entry.entityId)) {
        const type = entry.entityType;
        if (entityIdsByType[type]) {
          entityIdsByType[type].push(new ObjectId(entry.entityId));
        }
      }
    }

    console.log("[server] resolved search_index matches:", {
      resources: entityIdsByType.resource.length,
      notes: entityIdsByType.note.length,
      projects: entityIdsByType.project.length,
      people: entityIdsByType.person.length
    });

    const [resources, notes, projects, people, categories] = await Promise.all([
      entityIdsByType.resource.length > 0
        ? db.collection("resources").find({ _id: { $in: entityIdsByType.resource } }).toArray()
        : Promise.resolve([]),
      entityIdsByType.note.length > 0
        ? db.collection("notes").find({ _id: { $in: entityIdsByType.note } }).toArray()
        : Promise.resolve([]),
      entityIdsByType.project.length > 0
        ? db.collection("projects").find({ _id: { $in: entityIdsByType.project } }).toArray()
        : Promise.resolve([]),
      entityIdsByType.person.length > 0
        ? db.collection("people").find({ _id: { $in: entityIdsByType.person } }).toArray()
        : Promise.resolve([]),
      db.collection("categories").find({
        userId,
        $or: [
          { name: searchRegex },
          { title: searchRegex }
        ]
      }).limit(10).toArray()
    ]);

    console.log("[server] unified search completed. Resolved document counts:", {
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


