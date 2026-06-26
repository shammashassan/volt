"use server";

import { getDb, serialize } from "@/lib/db";
import { getSessionUser, getErrorMessage } from "@/lib/auth-utils";
import { updateTag } from "next/cache";
import { createWatchlistItemSchema } from "../_schemas/watchlist.schema";
import { WatchlistItem } from "../_types/watchlist.types";
import { WatchlistService } from "@/features/watchlist/services/watchlist.service";

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
