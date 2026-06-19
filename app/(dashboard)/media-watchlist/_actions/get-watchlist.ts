"use server";

import { getDb, serialize } from "@/lib/db";
import { getSessionUser, getErrorMessage } from "@/lib/auth-utils";
import { WatchlistItem } from "../_types/watchlist.types";

export async function getWatchlistAction(): Promise<{ success: boolean; data?: WatchlistItem[]; error?: string }> {
  try {
    const user = await getSessionUser();
    const db = await getDb();
    const items = await db
      .collection("watchlist")
      .find({ userId: user.id })
      .sort({ updatedAt: -1 })
      .toArray();

    return { success: true, data: serialize(items) as unknown as WatchlistItem[] };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}
