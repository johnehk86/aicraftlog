"use client";

import { useEffect, useState } from "react";

interface VisitorCounts {
  total: number;
  today: number;
}

export default function VisitorStats() {
  const [counts, setCounts] = useState<VisitorCounts | null>(null);

  useEffect(() => {
    fetch("/api/visitors", { method: "POST" })
      .then((res) => res.json())
      .then((data) => setCounts(data))
      .catch(() => setCounts({ total: 0, today: 0 }));
  }, []);

  if (!counts) {
    return (
      <div className="space-y-3">
        <div className="h-10 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
        <div className="h-10 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <StatItem label="Today" value={counts.today} />
      <StatItem label="Total" value={counts.total} />
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center rounded-lg bg-slate-50 px-3 py-2.5 dark:bg-slate-800/50">
      <span className="text-lg font-bold text-primary">
        {value.toLocaleString()}
      </span>
      <span className="text-xs text-slate-500 dark:text-slate-400">
        {label}
      </span>
    </div>
  );
}
