import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-utils";
import { SearchResult, WatchlistMediaType } from "@/app/(dashboard)/media-watchlist/_types/watchlist.types";

interface TmdbItem {
  id: number;
  media_type: string;
  title?: string;
  original_title?: string;
  name?: string;
  original_name?: string;
  poster_path?: string | null;
  release_date?: string;
  first_air_date?: string;
}

interface AniListItem {
  id: number;
  title: {
    english?: string;
    romaji?: string;
    native?: string;
  };
  coverImage: {
    large?: string | null;
  };
  startDate?: {
    year?: number;
  };
}

function parseYear(dateStr?: string): number | undefined {
  if (!dateStr) return undefined;
  const year = new Date(dateStr).getFullYear();
  return isNaN(year) ? undefined : year;
}

// 1. Modular TMDb Client & Mapper Service
async function searchTmdb(
  query: string,
  filterType: string,
  token?: string,
  key?: string
): Promise<SearchResult[]> {
  const hasAuth = !!(token || key);
  if (!hasAuth) {
    throw new Error("TMDB Auth credentials missing");
  }

  const baseUrl = "https://api.themoviedb.org/3/search/multi";
  const url = token 
    ? `${baseUrl}?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`
    : `${baseUrl}?api_key=${key}&query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`;

  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // 5s Request Timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(url, { headers, signal: controller.signal });
    if (!res.ok) throw new Error(`TMDB HTTP Error: ${res.status}`);
    const data = (await res.json()) as { results?: TmdbItem[] };

    const results: SearchResult[] = [];
    for (const item of data.results || []) {
      const type = item.media_type === "tv" ? "series" : (item.media_type as WatchlistMediaType);
      
      // Consistently enforce filterType check
      if (filterType !== "all" && filterType !== type) {
        continue;
      }

      if (type === "movie") {
        results.push({
          externalId: item.id.toString(),
          source: "tmdb",
          type: "movie",
          title: item.title || item.original_title || "",
          posterUrl: item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : null,
          releaseYear: parseYear(item.release_date),
        });
      } else if (type === "series") {
        results.push({
          externalId: item.id.toString(),
          source: "tmdb",
          type: "series",
          title: item.name || item.original_name || "",
          posterUrl: item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : null,
          releaseYear: parseYear(item.first_air_date),
        });
      }
    }
    return results;
  } finally {
    clearTimeout(timeoutId);
  }
}

// 2. Modular AniList Client & Mapper Service
async function searchAniList(query: string): Promise<SearchResult[]> {
  const queryStr = `
    query ($search: String) {
      Page(page: 1, perPage: 15) {
        media(search: $search, type: ANIME) {
          id
          title {
            english
            romaji
            native
          }
          coverImage {
            large
          }
          startDate {
            year
          }
        }
      }
    }
  `;

  // 5s Request Timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: queryStr,
        variables: { search: query },
      }),
      signal: controller.signal,
    });

    if (!response.ok) throw new Error(`AniList HTTP Error: ${response.status}`);
    const data = (await response.json()) as {
      data?: {
        Page?: {
          media?: AniListItem[];
        };
      };
    };

    const results: SearchResult[] = [];
    for (const media of data.data?.Page?.media || []) {
      results.push({
        externalId: media.id.toString(),
        source: "anilist",
        type: "anime",
        title: media.title.english || media.title.romaji || media.title.native || "",
        posterUrl: media.coverImage.large || null,
        releaseYear: media.startDate?.year || undefined,
      });
    }
    return results;
  } finally {
    clearTimeout(timeoutId);
  }
}

// 3. Simplified Endpoint Router
export async function GET(req: NextRequest) {
  try {
    // Validate session with correct HTTP 401 response
    try {
      await getSessionUser();
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    const filterType = searchParams.get("type") || "all";

    if (query.trim().length < 2) {
      return NextResponse.json({ results: [] });
    }

    const promises: Promise<SearchResult[]>[] = [];
    const warnings: string[] = [];

    // TMDb Request
    if (filterType === "all" || filterType === "movie" || filterType === "series") {
      const tmdbKey = process.env.TMDB_API_KEY || "";
      const tmdbToken = process.env.TMDB_READ_TOKEN || "";

      if (tmdbKey || tmdbToken) {
        promises.push(
          searchTmdb(query, filterType, tmdbToken, tmdbKey).catch((err) => {
            console.error("TMDB fetch error:", err);
            warnings.push("TMDb unavailable");
            return [];
          })
        );
      } else {
        warnings.push("TMDb API credentials not configured");
      }
    }

    // AniList Request
    if (filterType === "all" || filterType === "anime") {
      promises.push(
        searchAniList(query).catch((err) => {
          console.error("AniList fetch error:", err);
          warnings.push("AniList unavailable");
          return [];
        })
      );
    }

    const allResultsLists = await Promise.all(promises);
    const mergedResults = allResultsLists.flat();
    const truncatedResults = mergedResults.slice(0, 20);

    return NextResponse.json({
      results: truncatedResults,
      warnings: warnings.length > 0 ? warnings : undefined,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Search Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
