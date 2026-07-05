"use server";

import { revalidatePath, updateTag } from "next/cache";
import clientPromise from "../mongodb";
import { ObjectId } from "mongodb";
import { ResourceStatus, ResourceType } from "../types";
import { getSessionUser, getErrorMessage } from "../auth-utils";
import { getResources } from "../db";
import { SearchIndexRepository } from "@/features/search/repositories/search-index.repository";
import { cleanHtmlArticle } from "@/lib/utils/reader";

const searchIndexRepo = new SearchIndexRepository();

export async function addResourceAction(
  dataOrForm: FormData | {
    title: string;
    url: string;
    description?: string;
    categoryId?: string;
    tags: string[];
    notes?: string;
    whySaved?: string;
    status: ResourceStatus;
    type: ResourceType;
    favorite: boolean;
    projectIds: string[];
    personIds: string[];
  }
) {
  try {
    const user = await getSessionUser();
    const client = await clientPromise;
    const db = client.db();

    let resource: Record<string, unknown>;

    if (dataOrForm instanceof FormData) {
      // Support old FormData format
      const name = dataOrForm.get("name") as string;
      const link = dataOrForm.get("link") as string;
      const description = dataOrForm.get("description") as string;
      const category = dataOrForm.get("category") as string;
      const featured = dataOrForm.get("featured") === "on";
      const order = parseInt(dataOrForm.get("order") as string) || 0;

      resource = {
        title: name,
        url: link,
        description,
        categoryId: category === "none" || !category ? "" : category,
        tags: [],
        notes: "",
        whySaved: "",
        status: "saved" as ResourceStatus,
        type: "website" as ResourceType,
        favorite: featured,
        projectIds: [],
        personIds: [],
        useCount: 0,
        userId: user.id,
        order,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } else {
      // Support new structured data format
      resource = {
        ...dataOrForm,
        categoryId: dataOrForm.categoryId === "none" || !dataOrForm.categoryId ? "" : dataOrForm.categoryId,
        userId: user.id,
        useCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    // Check if duplicate resource (same URL and userId) already exists
    const cleanUrl = (resource.url as string || "").trim();
    if (cleanUrl) {
      const existing = await db.collection("resources").findOne({
        userId: user.id,
        url: cleanUrl
      });
      if (existing) {
        return {
          success: false,
          error: "A resource with this URL already exists in your library.",
          isDuplicate: true,
          id: existing._id.toString()
        };
      }
    }

    const result = await db.collection("resources").insertOne(resource);

    // Upsert into Search Index
    await searchIndexRepo.upsert({
      userId: user.id,
      title: (resource.title || resource.name || "") as string,
      description: (resource.description || resource.notes || "") as string,
      entityType: 'resource',
      entityId: result.insertedId.toString()
    });

    revalidatePath("/explore");
    revalidatePath("/resources");
    updateTag(`explore-body-${user.id}`);
    updateTag(`dashboard-stats-${user.id}`);
    return { success: true, id: result.insertedId.toString() };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateResourceAction(idOrLink: string, data: Record<string, unknown>) {
  try {
    const user = await getSessionUser();
    const client = await clientPromise;
    const db = client.db();

    const updateData: Record<string, unknown> = { ...data, updatedAt: new Date() };
    delete updateData._id;

    // Map old fields if they are present in the update object
    if (updateData.name) {
      updateData.title = updateData.name;
    }
    if (updateData.link) {
      updateData.url = updateData.link;
    }
    if (updateData.category) {
      updateData.categoryId = updateData.category === "none" ? "" : updateData.category;
    }
    if (updateData.categoryId !== undefined) {
      updateData.categoryId = updateData.categoryId === "none" ? "" : updateData.categoryId;
    }
    if (updateData.featured !== undefined) {
      updateData.favorite = updateData.featured;
    }
    if (typeof updateData.order === "string") {
      updateData.order = parseInt(updateData.order) || 0;
    }

    const query: Record<string, unknown> = { userId: user.id };
    if (ObjectId.isValid(idOrLink)) {
      query._id = new ObjectId(idOrLink);
    } else {
      query.url = idOrLink; // For old code using link
    }

    await db.collection("resources").updateOne(query, { $set: updateData });

    // Fetch the updated resource to update Search Index
    const updated = await db.collection("resources").findOne(query);
    if (updated) {
      await searchIndexRepo.upsert({
        userId: user.id,
        title: (updated.title || updated.name || "") as string,
        description: (updated.description || updated.notes || "") as string,
        entityType: 'resource',
        entityId: updated._id.toString()
      });
    }

    revalidatePath("/explore");
    revalidatePath("/resources");
    updateTag(`explore-body-${user.id}`);
    updateTag(`dashboard-stats-${user.id}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function deleteResourceAction(idOrLink: string) {
  try {
    const user = await getSessionUser();
    const client = await clientPromise;
    const db = client.db();

    const query: Record<string, unknown> = { userId: user.id };
    if (ObjectId.isValid(idOrLink)) {
      query._id = new ObjectId(idOrLink);
    } else {
      query.url = idOrLink; // For old code using link
    }

    let entityId = idOrLink;
    if (!ObjectId.isValid(idOrLink)) {
      const res = await db.collection("resources").findOne(query);
      if (res) {
        entityId = res._id.toString();
      }
    }

    await db.collection("resources").deleteOne(query);

    if (entityId) {
      await searchIndexRepo.remove(entityId);
    }

    revalidatePath("/explore");
    revalidatePath("/resources");
    updateTag(`explore-body-${user.id}`);
    updateTag(`dashboard-stats-${user.id}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function trackResourceViewAction(id: string) {
  try {
    const user = await getSessionUser();
    const client = await clientPromise;
    const db = client.db();

    await db.collection("resources").updateOne(
      { _id: new ObjectId(id), userId: user.id },
      { $set: { recentlyViewedAt: new Date() } }
    );
    updateTag(`explore-body-${user.id}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function useResourceAction(id: string) {
  try {
    const user = await getSessionUser();
    const client = await clientPromise;
    const db = client.db();

    await db.collection("resources").updateOne(
      { _id: new ObjectId(id), userId: user.id },
      { 
        $set: { recentlyUsedAt: new Date() },
        $inc: { useCount: 1 } 
      }
    );
    updateTag(`explore-body-${user.id}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateResourceOrdersAction(updates: { link: string; order: number }[]) {
  try {
    const user = await getSessionUser();
    const client = await clientPromise;
    const db = client.db();

    await Promise.all(
      updates.map(({ link, order }) =>
        db.collection("resources").updateOne(
          { url: link, userId: user.id }, 
          { $set: { order, updatedAt: new Date() } }
        )
      )
    );
    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// Server Action replacement for GET /api/resources
export async function getResourcesAction() {
  try {
    const user = await getSessionUser();
    const resources = await getResources(user.id);
    return { success: true, data: resources };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getResourceAction(id: string) {
  try {
    const user = await getSessionUser();
    const client = await clientPromise;
    const db = client.db();

    const query = ObjectId.isValid(id) ? { _id: new ObjectId(id), userId: user.id } : { url: id, userId: user.id };
    const resource = await db.collection("resources").findOne(query);

    if (!resource) {
      return { success: false, error: "Resource not found" };
    }

    // Convert ObjectId and Dates to string for safe serialization
    const serialized = {
      ...resource,
      _id: resource._id.toString(),
      createdAt: resource.createdAt?.toISOString(),
      updatedAt: resource.updatedAt?.toISOString()
    };

    return { success: true, data: serialized };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getReaderContentAction(resourceId: string) {
  try {
    const user = await getSessionUser();
    const client = await clientPromise;
    const db = client.db();

    // Find the resource
    const resource = await db.collection("resources").findOne({
      _id: new ObjectId(resourceId),
      userId: user.id
    });

    if (!resource) {
      return { success: false, error: "Resource not found" };
    }

    // 1. If already parsed and cached, return cached html
    if (resource.readerHtml) {
      return {
        success: true,
        data: {
          title: resource.title || resource.name || "Untitled Article",
          url: resource.url || resource.link || "",
          content: resource.readerHtml,
          wordCount: resource.readerWordCount || 0,
          readingTime: resource.readerReadingTime || 0,
          scrollProgress: resource.readerScrollProgress || 0
        }
      };
    }

    // 2. Fetch the remote HTML on the server
    const targetUrl = resource.url || resource.link;
    if (!targetUrl) {
      return { success: false, error: "This resource has no valid URL link." };
    }

    // Ensure url has a protocol
    let finalUrl = targetUrl.trim();
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = `https://${finalUrl}`;
    }

    const response = await fetch(finalUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      next: { revalidate: 86400 } // Cache remote fetch for 24h
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch page: HTTP ${response.status}`);
    }

    const html = await response.text();
    
    // 3. Clean HTML
    const cleaned = cleanHtmlArticle(html, resource.title || resource.name, finalUrl);

    // 4. Update the MongoDB document with cached contents
    await db.collection("resources").updateOne(
      { _id: new ObjectId(resourceId), userId: user.id },
      {
        $set: {
          readerHtml: cleaned.content,
          readerWordCount: cleaned.wordCount,
          readerReadingTime: cleaned.readingTime,
          updatedAt: new Date()
        }
      }
    );

    return {
      success: true,
      data: {
        title: cleaned.title,
        url: finalUrl,
        content: cleaned.content,
        wordCount: cleaned.wordCount,
        readingTime: cleaned.readingTime,
        scrollProgress: 0
      }
    };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateReadingProgressAction(resourceId: string, progress: number) {
  try {
    const user = await getSessionUser();
    const client = await clientPromise;
    const db = client.db();

    await db.collection("resources").updateOne(
      { _id: new ObjectId(resourceId), userId: user.id },
      { $set: { readerScrollProgress: progress } }
    );

    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
