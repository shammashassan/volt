"use server";

import { getDb, serialize } from "@/lib/db";
import { getSessionUser, getErrorMessage } from "@/lib/auth-utils";
import { updateTag } from "next/cache";
import { ObjectId } from "mongodb";
import { createWatchlistItemSchema, updateWatchlistStatusSchema, updateWatchlistRatingSchema } from "@/lib/validations/watchlist.schema";
import { WatchlistItem } from "@/types/watchlist";
import { WatchlistService } from "@/lib/services/watchlist.service";

export async function createWatchlistItemAction(payload: unknown): Promise<{ success: boolean; exists?: boolean; data?: WatchlistItem; error?: string }> {
  try {
    const user = await getSessionUser();
    const validated = createWatchlistItemSchema.parse(payload);
    const db = await getDb();

    // Check duplicate
    const existing = await db.collection("watchlist").findOne({
      userId: user.id,
      source: validated.source,
      externalId: validated.externalId,
    });

    if (existing) {
      return { success: true, exists: true, data: serialize(existing) as unknown as WatchlistItem };
    }

    const item: Omit<WatchlistItem, "_id"> = {
      userId: user.id,
      externalId: validated.externalId,
      source: validated.source,
      type: validated.type,
      status: validated.status,
      rating: validated.rating,
      metadata: validated.metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("watchlist").insertOne(item);
    
    // Sync metadata immediately
    try {
      await WatchlistService.syncItemById(result.insertedId);
    } catch (err) {
      console.error("Failed to sync watchlist item metadata on creation:", err);
    }

    const syncedItem = await db.collection("watchlist").findOne({ _id: result.insertedId });
    const finalItem = syncedItem || { ...item, _id: result.insertedId.toString() };

    updateTag("watchlist");
    updateTag(`watchlist-${user.id}`);

    return { success: true, exists: false, data: serialize(finalItem) as unknown as WatchlistItem };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

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

      // If status was changed, trigger an immediate metadata sync
      if ("status" in payload) {
        try {
          await WatchlistService.syncItemById(id);
        } catch (err) {
          console.error("Failed to sync watchlist item metadata on update:", err);
        }
      }
    }

    updateTag("watchlist");
    updateTag(`watchlist-${user.id}`);

    return { success: true };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}
