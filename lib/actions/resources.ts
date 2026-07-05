"use server";

import { revalidatePath, updateTag } from "next/cache";
import clientPromise from "../mongodb";
import { ObjectId } from "mongodb";
import { ResourceStatus, ResourceType } from "../types";
import { getSessionUser, getErrorMessage } from "../auth-utils";
import { getResources } from "../db";
import { SearchIndexRepository } from "@/features/search/repositories/search-index.repository";

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

    // Trigger background AI enrichment asynchronously (crawls, summarizes, tags & updates search indexes)
    void enrichResourceWithAi(result.insertedId.toString(), resource.url as string);

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
      const combinedDesc = `${updated.description || updated.notes || ""}${updated.summary ? `\n\nAI Takeaways:\n${updated.summary}` : ""}`;
      await searchIndexRepo.upsert({
        userId: user.id,
        title: (updated.title || updated.name || "") as string,
        description: combinedDesc,
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

function cleanHtml(html: string): string {
  // Remove scripts
  let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  // Remove styles
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  // Remove HTML comments
  text = text.replace(/<!--[\s\S]*?-->/g, '');
  // Extract body content if present
  const bodyMatch = text.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    text = bodyMatch[1];
  }
  // Strip all HTML tags
  text = text.replace(/<[^>]+>/g, ' ');
  // Normalize whitespace
  text = text.replace(/\s+/g, ' ').trim();
  // Truncate to first 30,000 characters
  return text.slice(0, 30000);
}

export async function enrichResourceWithAi(resourceId: string, url: string) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is not defined. Skipping AI enrichment.");
      return { success: false, error: "GEMINI_API_KEY is not defined" };
    }

    // 1. Crawl URL
    let targetUrl = url.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
    }

    let crawledText = "";
    try {
      const response = await fetch(targetUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        next: { revalidate: 3600 },
      });
      if (response.ok) {
        const html = await response.text();
        crawledText = cleanHtml(html);
      }
    } catch (crawlErr) {
      console.error(`Failed to crawl URL ${targetUrl}:`, crawlErr);
    }

    const promptText = crawledText 
      ? `Summarize this webpage content. URL: ${targetUrl}\nContent:\n${crawledText}`
      : `Provide a best-guess summary and tags for this webpage URL: ${targetUrl}`;

    // 2. Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${promptText}\n\nYou are a professional research assistant. Analyze the webpage and extract:
1. A summary of exactly 3 bullet points, each on a new line starting with '•'. Be concise, informative, and readable.
2. A list of 3 to 6 lowercase tags relevant to the topic.
Format your output as a JSON object matching this schema.`,
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                summary: { 
                  type: "STRING", 
                  description: "Exactly 3 key takeaways, each starting with '•' on a new line." 
                },
                tags: { 
                  type: "ARRAY", 
                  items: { type: "STRING" },
                  description: "List of 3 to 6 lowercase tags." 
                },
              },
              required: ["summary", "tags"],
            },
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error: ${response.statusText} - ${errText}`);
    }

    const resData = await response.json();
    const resultText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!resultText) {
      throw new Error("No summary content returned from Gemini API");
    }

    const parsed = JSON.parse(resultText);
    const summary = parsed.summary?.trim() || "";
    const aiTags = Array.isArray(parsed.tags) ? parsed.tags.map((t: string) => t.trim().toLowerCase()).filter(Boolean) : [];

    // 3. Update MongoDB resource document
    const client = await clientPromise;
    const db = client.db();
    const resource = await db.collection("resources").findOne({ _id: new ObjectId(resourceId) });
    if (!resource) {
      throw new Error("Resource not found in database for AI update");
    }

    await db.collection("resources").updateOne(
      { _id: new ObjectId(resourceId) },
      { $set: { summary, aiTags, updatedAt: new Date() } }
    );

    // 4. Update Search Index
    const combinedDesc = `${resource.description || resource.notes || ""}\n\nAI Takeaways:\n${summary}`;
    await searchIndexRepo.upsert({
      userId: resource.userId.toString(),
      title: (resource.title || resource.name || "") as string,
      description: combinedDesc,
      entityType: "resource",
      entityId: resourceId,
    });

    // Revalidate paths
    revalidatePath("/explore");
    revalidatePath("/resources");
    updateTag(`explore-body-${resource.userId}`);
    updateTag(`dashboard-stats-${resource.userId}`);

    return { success: true, summary, aiTags };
  } catch (error) {
    console.error("Error in enrichResourceWithAi background worker:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}
