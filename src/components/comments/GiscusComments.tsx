"use client";

import Giscus from "@giscus/react";
import { useTheme } from "next-themes";

interface GiscusCommentsProps {
  slug: string;
  title: string;
}

export default function GiscusComments({ slug, title }: GiscusCommentsProps) {
  const { resolvedTheme } = useTheme();

  return (
    <div className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-800">
      <Giscus
        id="comments"
        repo="johnehk86/aicraftlog"
        repoId={process.env.NEXT_PUBLIC_GISCUS_REPO_ID!}
        category="Announcements"
        categoryId={process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID!}
        mapping="specific"
        term={slug}
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        lang="ko"
        loading="lazy"
      />
    </div>
  );
}
