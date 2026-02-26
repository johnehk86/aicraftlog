"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { SITE_CONFIG } from "@/lib/constants";

interface CusdisCommentsProps {
  slug: string;
  title: string;
}

export default function CusdisComments({ slug, title }: CusdisCommentsProps) {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  const appId = process.env.NEXT_PUBLIC_CUSDIS_APP_ID;
  const host = process.env.NEXT_PUBLIC_CUSDIS_HOST || "https://cusdis.com";

  useEffect(() => {
    if (!appId || !containerRef.current) return;

    const script = document.createElement("script");
    script.src = `${host}/js/cusdis.es.js`;
    script.async = true;
    script.defer = true;
    containerRef.current.appendChild(script);

    return () => {
      script.remove();
    };
  }, [appId, host]);

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).CUSDIS) {
      (window as any).CUSDIS.setTheme(theme === "dark" ? "dark" : "light");
    }
  }, [theme]);

  if (!appId) return null;

  return (
    <div className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-800">
      <div
        ref={containerRef}
        id="cusdis_thread"
        data-host={host}
        data-app-id={appId}
        data-page-id={slug}
        data-page-url={`${SITE_CONFIG.url}/blog/${slug}`}
        data-page-title={title}
        data-theme={theme === "dark" ? "dark" : "light"}
      />
    </div>
  );
}
