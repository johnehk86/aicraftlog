"use client";

import { useEffect, useState } from "react";

interface PostViewCountProps {
  slug: string;
}

export default function PostViewCount({ slug }: PostViewCountProps) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/postviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    })
      .then((res) => res.json())
      .then((data) => setCount(data.total ?? 0))
      .catch(() => setCount(null));
  }, [slug]);

  if (count === null) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="material-symbols-outlined text-[16px]">
          visibility
        </span>
        <span className="inline-block h-4 w-8 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="material-symbols-outlined text-[16px]">visibility</span>
      <span>{count.toLocaleString()} views</span>
    </div>
  );
}
