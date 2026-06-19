"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { SearchResult } from "../_types/watchlist.types";
import { Film } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AddMediaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (result: SearchResult) => void;
}

export function AddMediaDialog({ open, onOpenChange, onSelect }: AddMediaDialogProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Keyboard shortcut watcher (⌘M or Ctrl+M)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "m" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onOpenChange]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }
  }, [open]);

  // Handle Search Queries with Debounce
  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (val.trim().length < 2) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/watchlist/search?q=${encodeURIComponent(val)}`);
        if (!res.ok) throw new Error("Search request failed");
        const data = await res.json();
        setResults(data.results || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to search.");
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search movies, series, anime..."
        value={query}
        onValueChange={handleQueryChange}
      />
      <CommandList className="max-h-[380px] overflow-y-auto">
        {loading && (
          <div className="p-4 space-y-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="flex gap-3 items-center animate-pulse">
                <div className="h-12 w-8 bg-muted rounded" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3.5 bg-muted rounded w-2/3" />
                  <div className="h-2.5 bg-muted rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && <div className="p-4 text-center text-sm text-destructive">{error}</div>}

        {!loading && !error && query.trim().length >= 2 && results.length === 0 && (
          <CommandEmpty>No media found.</CommandEmpty>
        )}

        {!loading && !error && query.trim().length < 2 && (
          <div className="p-4 text-center text-sm text-muted-foreground select-none">
            Type to search movies, series, or anime...
          </div>
        )}

        {!loading && !error && results.length > 0 && (
          <CommandGroup heading="Results">
            {results.map((item) => (
              <CommandItem
                key={`${item.source}-${item.externalId}`}
                value={`${item.title} ${item.releaseYear || ""}`}
                onSelect={() => onSelect(item)}
                className="cursor-pointer p-2 flex items-center gap-3 hover:bg-accent/40 rounded-md transition-colors"
              >
                <div className="relative h-12 w-8 bg-muted/40 rounded overflow-hidden shrink-0 flex items-center justify-center">
                  {item.posterUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.posterUrl} alt={item.title} className="object-cover h-full w-full" />
                  ) : (
                    <Film className="h-4 w-4 text-muted-foreground/50 stroke-1" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs leading-tight truncate">{item.title}</span>
                    {item.releaseYear && (
                      <span className="text-[10px] text-muted-foreground shrink-0">({item.releaseYear})</span>
                    )}
                  </div>
                  <div className="flex gap-1.5 mt-1">
                    <Badge variant="outline" className="text-[9px] py-0 px-1 font-semibold uppercase">
                      {item.type === "movie" ? "Movie" : item.type === "series" ? "Series" : "Anime"}
                    </Badge>
                    <Badge variant="outline" className="text-[9px] py-0 px-1 font-semibold uppercase tracking-wider bg-accent/20 border-accent-foreground/10 text-muted-foreground">
                      {item.source === "tmdb" ? "TMDb" : "AniList"}
                    </Badge>
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
