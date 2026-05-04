"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import clientPromise from "./mongodb";
import { auth } from "./auth";

const COLLECTION = "resources";

async function getCollection() {
  const client = await clientPromise;
  return client.db().collection(COLLECTION);
}

export async function addResourceAction(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const link = formData.get("link") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const featured = formData.get("featured") === "on";

  const newResource = { name, link, description, category, featured, createdAt: new Date() };

  try {
    const collection = await getCollection();
    
    // Duplicate checks
    const duplicateLink = await collection.findOne({ link: { $regex: new RegExp(`^${link}$`, "i") } });
    if (duplicateLink) {
      return { success: false, error: "A resource with this link already exists" };
    }

    const duplicateName = await collection.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
    if (duplicateName) {
      return { success: false, error: "A resource with this name already exists" };
    }

    await collection.insertOne(newResource);
    revalidateTag("resources", "max");
    revalidatePath("/explore");
    revalidatePath("/resources");
    return { success: true };
  } catch (error) {
    console.error("Failed to add resource:", error);
    return { success: false, error: "Failed to save resource" };
  }
}

export async function deleteResourceAction(link: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const collection = await getCollection();
    await collection.deleteOne({ link });
    revalidateTag("resources", "max");
    revalidatePath("/explore");
    revalidatePath("/resources");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete resource:", error);
    return { success: false, error: "Failed to delete resource" };
  }
}

export async function updateResourceAction(oldLink: string, data: any) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const collection = await getCollection();
    
    const existing = await collection.findOne({ link: oldLink });
    if (!existing) {
      return { success: false, error: "Resource not found" };
    }

    // Duplicate checks for updates (excluding the current resource)
    if (data.link && data.link.toLowerCase() !== oldLink.toLowerCase()) {
      const duplicateLink = await collection.findOne({ 
        link: { $regex: new RegExp(`^${data.link}$`, "i") },
        _id: { $ne: existing._id }
      });
      if (duplicateLink) {
        return { success: false, error: "A resource with this link already exists" };
      }
    }

    if (data.name) {
      const duplicateName = await collection.findOne({ 
        name: { $regex: new RegExp(`^${data.name}$`, "i") },
        _id: { $ne: existing._id }
      });
      if (duplicateName) {
        return { success: false, error: "A resource with this name already exists" };
      }
    }

    await collection.updateOne({ _id: existing._id }, { $set: { ...data, updatedAt: new Date() } });
    revalidateTag("resources", "max");
    revalidatePath("/explore");
    revalidatePath("/resources");
    revalidatePath("/categories");
    return { success: true };
  } catch (error) {
    console.error("Failed to update resource:", error);
    return { success: false, error: "Failed to update resource" };
  }
}

// Category Actions
export async function addCategoryAction(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const icon = formData.get("icon") as string;
  const order = parseInt(formData.get("order") as string) || 0;

  try {
    const client = await clientPromise;
    const db = client.db();
    
    // Duplicate check
    const existing = await db.collection("categories").findOne({ id });
    if (existing) {
      return { success: false, error: "Category ID already exists" };
    }

    await db.collection("categories").insertOne({
      id,
      title,
      description,
      icon,
      order,
      createdAt: new Date()
    });

    revalidateTag("categories", "max");
    revalidatePath("/explore");
    revalidatePath("/categories");
    return { success: true };
  } catch (error) {
    console.error("Failed to add category:", error);
    return { success: false, error: "Failed to save category" };
  }
}

export async function updateCategoryAction(oldId: string, data: any) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    
    const existing = await db.collection("categories").findOne({ id: oldId });
    if (!existing) {
      return { success: false, error: "Category not found" };
    }

    const { title, description, icon, order } = data;

    await db.collection("categories").updateOne(
      { id: oldId },
      { $set: { 
        ...(title && { title }),
        ...(description && { description }),
        ...(icon && { icon }),
        ...(typeof order === 'number' && { order }),
        updatedAt: new Date() 
      } }
    );

    revalidateTag("categories", "max");
    revalidatePath("/explore");
    revalidatePath("/categories");
    revalidatePath(`/category/${oldId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update category:", error);
    return { success: false, error: "Failed to update category" };
  }
}

export async function deleteCategoryAction(id: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    
    // Check if category has resources
    const resourcesCount = await db.collection("resources").countDocuments({ category: id });
    if (resourcesCount > 0) {
      return { success: false, error: "Cannot delete category that contains resources" };
    }

    await db.collection("categories").deleteOne({ id });
    revalidateTag("categories", "max");
    revalidatePath("/explore");
    revalidatePath("/categories");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete category:", error);
    return { success: false, error: "Failed to delete category" };
  }
}
