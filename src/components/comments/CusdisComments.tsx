"use client";

import { useEffect, useRef, useCallback } from "react";
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

  const loadCusdis = useCallback(() => {
    if (!appId) return;

    // If CUSDIS is already loaded, just re-render
    if ((window as any).CUSDIS) {
      (window as any).CUSDIS.renderTo(containerRef.current);
      return;
    }

    // Load script only once globally
    if (!document.querySelector(`script[src="${host}/js/cusdis.es.js"]`)) {
      const script = document.createElement("script");
      script.src = `${host}/js/cusdis.es.js`;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, [appId, host]);

  useEffect(() => {
    loadCusdis();
  }, [loadCusdis]);

  useEffect(() => {
    if ((window as any).CUSDIS) {
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
