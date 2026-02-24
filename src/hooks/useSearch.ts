"use client";

import { useState, useEffect, useCallback } from "react";
import Fuse from "fuse.js";

interface SearchItem {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  date: string;
}

export function useSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [fuse, setFuse] = useState<Fuse<SearchItem> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/search-index.json")
      .then((res) => res.json())
      .then((data: SearchItem[]) => {
        const fuseInstance = new Fuse(data, {
          keys: [
            { name: "title", weight: 2 },
            { name: "description", weight: 1.5 },
            { name: "tags", weight: 1 },
          ],
          threshold: 0.3,
        });
        setFuse(fuseInstance);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const search = useCallback(
    (q: string) => {
      setQuery(q);
      if (!fuse || q.trim().length === 0) {
        setResults([]);
        return;
      }
      setResults(fuse.search(q).map((r) => r.item));
    },
    [fuse]
  );

  return { query, results, search, loading };
}
