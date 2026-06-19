import React from "react";
import { getWatchlistAction } from "./_actions/get-watchlist";
import { MediaWatchlistClient } from "./_components/media-watchlist-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Media Watchlist - Volt",
  description: "Track movies, series, and anime in one place.",
};

export default async function MediaWatchlistPage() {
  const res = await getWatchlistAction();
  const initialItems = res.success && res.data ? res.data : [];

  return <MediaWatchlistClient initialItems={initialItems} />;
}
