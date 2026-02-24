"use client";

import { useState, useRef } from "react";

export default function CodeBlock(props: React.HTMLAttributes<HTMLPreElement>) {
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  const handleCopy = async () => {
    const code = preRef.current?.textContent || "";
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative">
      <pre ref={preRef} {...props} />
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 flex items-center gap-1 rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-xs text-slate-600 opacity-0 backdrop-blur-sm transition-all hover:bg-white group-hover:opacity-100 dark:border-primary/20 dark:bg-bg-dark/80 dark:text-slate-400 dark:hover:bg-bg-dark"
        aria-label="Copy code"
      >
        <span className="material-symbols-outlined text-[14px]">
          {copied ? "check" : "content_copy"}
        </span>
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
