import { z } from "zod";

export const createWatchlistItemSchema = z.object({
  externalId: z.string().min(1),
  source: z.enum(["tmdb", "anilist"]),
  type: z.enum(["movie", "series", "anime"]),
  status: z.enum(["planned", "watching", "completed", "dropped"]).default("planned"),
  rating: z.number().int().min(1).max(10).optional(),
  metadata: z.object({
    title: z.string().min(1),
    posterUrl: z.string().optional(),
    releaseYear: z.number().int().optional(),
  }).optional(),
});

export const updateWatchlistStatusSchema = z.object({
  status: z.enum(["planned", "watching", "completed", "dropped"]),
});

export const updateWatchlistRatingSchema = z.object({
  rating: z.number().int().min(1).max(10).optional().nullable(),
});
