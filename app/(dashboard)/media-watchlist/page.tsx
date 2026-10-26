import React from "react";
import { getWatchlistAction } from "@/lib/queries/watchlist";
import { MediaWatchlistClient } from "@/components/watchlist/media-watchlist-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Media Watchlist",
  description: "Track movies, series, and anime in one place.",
};

export default async function MediaWatchlistPage() {
  const res = await getWatchlistAction();
  const initialItems = res.success && res.data ? res.data : [];

  return <MediaWatchlistClient initialItems={initialItems} />;
}
