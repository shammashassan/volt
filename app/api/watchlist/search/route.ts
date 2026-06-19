import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-utils";
import { SearchResult } from "@/app/(dashboard)/media-watchlist/_types/watchlist.types";

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

export async function GET(req: NextRequest) {
  try {
    // Validate session
    await getSessionUser();

    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    const filterType = searchParams.get("type") || "all";

    if (query.trim().length < 2) {
      return NextResponse.json({ results: [] });
    }

    const promises: Promise<SearchResult[]>[] = [];
    const warnings: string[] = [];

    // TMDb search (Movies & Series)
    const tmdbKey = process.env.TMDB_API_KEY || "";
    const tmdbToken = process.env.TMDB_READ_TOKEN || "";

    if (filterType === "all" || filterType === "movie" || filterType === "series") {
      if (tmdbKey || tmdbToken) {
        promises.push(
          (async () => {
            try {
              const url = `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`;
              const headers: HeadersInit = {};
              if (tmdbToken) {
                headers["Authorization"] = `Bearer ${tmdbToken}`;
              } else if (tmdbKey) {
                // Fallback query param for key
                return fetchTmdbWithKey(query, tmdbKey);
              }

              const res = await fetch(url, { headers });
              if (!res.ok) throw new Error("TMDB Response Error");
              const data = (await res.json()) as { results?: TmdbItem[] };
              
              const results: SearchResult[] = [];
              for (const item of data.results || []) {
                if (item.media_type === "movie" && (filterType === "all" || filterType === "movie")) {
                  results.push({
                    externalId: item.id.toString(),
                    source: "tmdb",
                    type: "movie",
                    title: item.title || item.original_title || "",
                    posterUrl: item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : null,
                    releaseYear: item.release_date ? new Date(item.release_date).getFullYear() : undefined,
                  });
                } else if (item.media_type === "tv" && (filterType === "all" || filterType === "series")) {
                  results.push({
                    externalId: item.id.toString(),
                    source: "tmdb",
                    type: "series",
                    title: item.name || item.original_name || "",
                    posterUrl: item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : null,
                    releaseYear: item.first_air_date ? new Date(item.first_air_date).getFullYear() : undefined,
                  });
                }
              }
              return results;
            } catch (err) {
              console.error("TMDB fetch error:", err);
              warnings.push("TMDb unavailable");
              return [];
            }
          })()
        );
      } else {
        warnings.push("TMDb API key not configured");
      }
    }

    // AniList search (Anime)
    if (filterType === "all" || filterType === "anime") {
      promises.push(
        (async () => {
          try {
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
            });

            if (!response.ok) throw new Error("AniList Response Error");
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
          } catch (err) {
            console.error("AniList fetch error:", err);
            warnings.push("AniList unavailable");
            return [];
          }
        })()
      );
    }

    const allResultsLists = await Promise.all(promises);
    const mergedResults = allResultsLists.flat();

    // Sort and truncate to a max of 20 results
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

async function fetchTmdbWithKey(query: string, key: string): Promise<SearchResult[]> {
  const url = `https://api.themoviedb.org/3/search/multi?api_key=${key}&query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("TMDB API Key Request Failed");
  const data = (await res.json()) as { results?: TmdbItem[] };
  const results: SearchResult[] = [];
  for (const item of data.results || []) {
    if (item.media_type === "movie") {
      results.push({
        externalId: item.id.toString(),
        source: "tmdb",
        type: "movie",
        title: item.title || item.original_title || "",
        posterUrl: item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : null,
        releaseYear: item.release_date ? new Date(item.release_date).getFullYear() : undefined,
      });
    } else if (item.media_type === "tv") {
      results.push({
        externalId: item.id.toString(),
        source: "tmdb",
        type: "series",
        title: item.name || item.original_name || "",
        posterUrl: item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : null,
        releaseYear: item.first_air_date ? new Date(item.first_air_date).getFullYear() : undefined,
      });
    }
  }
  return results;
}
