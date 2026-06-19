"use server";

import { getDb } from "@/lib/db";
import { getSessionUser, getErrorMessage } from "@/lib/auth-utils";
import { updateTag } from "next/cache";
import { ObjectId } from "mongodb";
import { updateWatchlistStatusSchema, updateWatchlistRatingSchema } from "../_schemas/watchlist.schema";

export async function updateWatchlistItemAction(id: string, payload: Record<string, unknown>): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getSessionUser();
    const db = await getDb();

    // Check ownership
    const existing = await db.collection("watchlist").findOne({
      _id: new ObjectId(id),
      userId: user.id,
    });

    if (!existing) {
      return { success: false, error: "Watchlist item not found" };
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if ("status" in payload) {
      const validated = updateWatchlistStatusSchema.parse(payload);
      updateData.status = validated.status;
    }

    let unsetData: Record<string, string> | null = null;

    if ("rating" in payload) {
      const validated = updateWatchlistRatingSchema.parse(payload);
      if (validated.rating === null || validated.rating === undefined) {
        unsetData = { rating: "" };
      } else {
        updateData.rating = validated.rating;
      }
    }

    const updateOp: { $set?: Record<string, unknown>; $unset?: Record<string, string> } = {};
    if (Object.keys(updateData).length > 0) {
      updateOp.$set = updateData;
    }
    if (unsetData) {
      updateOp.$unset = unsetData;
    }

    if (Object.keys(updateOp).length > 0) {
      await db.collection("watchlist").updateOne(
        { _id: new ObjectId(id) },
        updateOp
      );
    }

    updateTag("watchlist");
    updateTag(`watchlist-${user.id}`);

    return { success: true };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}
