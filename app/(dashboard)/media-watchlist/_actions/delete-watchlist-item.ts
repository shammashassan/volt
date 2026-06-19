"use server";

import { getDb } from "@/lib/db";
import { getSessionUser, getErrorMessage } from "@/lib/auth-utils";
import { updateTag } from "next/cache";
import { ObjectId } from "mongodb";

export async function deleteWatchlistItemAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getSessionUser();
    const db = await getDb();

    const result = await db.collection("watchlist").deleteOne({
      _id: new ObjectId(id),
      userId: user.id,
    });

    if (result.deletedCount === 0) {
      return { success: false, error: "Item not found or unauthorized" };
    }

    updateTag("watchlist");
    updateTag(`watchlist-${user.id}`);

    return { success: true };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}
