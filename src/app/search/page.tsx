"use client";

import { useState, useEffect, useCallback } from "react";
import Fuse from "fuse.js";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { getCategoryName } from "@/lib/constants";

interface SearchItem {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  date: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [fuse, setFuse] = useState<Fuse<SearchItem> | null>(null);

  useEffect(() => {
    fetch("/search-index.json")
      .then((res) => res.json())
      .then((data: SearchItem[]) => {
        const fuseInstance = new Fuse(data, {
          keys: [
            { name: "title", weight: 2 },
            { name: "description", weight: 1.5 },
            { name: "tags", weight: 1 },
            { name: "category", weight: 0.5 },
          ],
          threshold: 0.3,
          includeScore: true,
        });
        setFuse(fuseInstance);
      })
      .catch(() => {});
  }, []);

  const handleSearch = useCallback(
    (q: string) => {
      setQuery(q);
      if (!fuse || q.trim().length === 0) {
        setResults([]);
        return;
      }
      const searchResults = fuse.search(q).map((r) => r.item);
      setResults(searchResults);
    },
    [fuse]
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Search</h1>
      <div className="relative mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search posts..."
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pl-11 text-lg outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-primary/20 dark:bg-slate-900/50 dark:focus:border-primary dark:focus:ring-primary/20"
          autoFocus
        />
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-slate-400">
          search
        </span>
      </div>

      {query.length > 0 && (
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          {results.length} {results.length === 1 ? "result" : "results"}
        </p>
      )}

      <div className="space-y-4">
        {results.map((item) => (
          <Link
            key={item.slug}
            href={`/blog/${item.slug}`}
            className="glass-card block p-4 transition-shadow hover:shadow-md"
          >
            <span className="mb-1 block text-[10px] font-bold uppercase text-primary">
              {getCategoryName(item.category)}
            </span>
            <h2 className="mb-1 text-lg font-bold">{item.title}</h2>
            <p className="mb-2 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
              {item.description}
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <time>{formatDate(item.date)}</time>
              {item.tags.slice(0, 3).map((tag) => (
                <span key={tag}>#{tag}</span>
              ))}
            </div>
          </Link>
        ))}
      </div>

      {query.length > 0 && results.length === 0 && (
        <div className="py-20 text-center">
          <span className="material-symbols-outlined mb-4 text-[48px] text-slate-300 dark:text-slate-600">
            search_off
          </span>
          <p className="text-slate-500 dark:text-slate-400">
            No results found for &ldquo;{query}&rdquo;.
          </p>
        </div>
      )}
    </div>
  );
}
