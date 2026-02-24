"use client";

import Link from "next/link";
import { useState } from "react";
import { CATEGORY_GROUPS } from "@/lib/constants";
import { PostMeta } from "@/types/post";

interface SidebarProps {
  recentPosts?: PostMeta[];
  popularPosts?: PostMeta[];
  allTags?: string[];
  categoryCounts?: Record<string, number>;
}

export default function Sidebar({
  recentPosts = [],
  popularPosts = [],
  allTags = [],
  categoryCounts = {},
}: SidebarProps) {
  return (
    <aside className="space-y-6">
      {/* Category Tree */}
      <SidebarWidget title="Categories" icon="folder">
        <CategoryTree categoryCounts={categoryCounts} />
      </SidebarWidget>

      {/* Recent Posts */}
      {recentPosts.length > 0 && (
        <SidebarWidget title="Recent Posts" icon="schedule">
          <ul className="space-y-2.5">
            {recentPosts.slice(0, 5).map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-sm text-slate-600 transition-colors hover:text-primary dark:text-slate-400 dark:hover:text-primary-400 line-clamp-2"
                >
                  {post.frontmatter.title}
                </Link>
              </li>
            ))}
          </ul>
        </SidebarWidget>
      )}

      {/* Popular Posts */}
      {popularPosts.length > 0 && (
        <SidebarWidget title="Popular" icon="trending_up">
          <ul className="space-y-2.5">
            {popularPosts.slice(0, 5).map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-sm text-slate-600 transition-colors hover:text-primary dark:text-slate-400 dark:hover:text-primary-400 line-clamp-2"
                >
                  {post.frontmatter.title}
                </Link>
              </li>
            ))}
          </ul>
        </SidebarWidget>
      )}

      {/* Tag Cloud */}
      {allTags.length > 0 && (
        <SidebarWidget title="Tags" icon="tag">
          <div className="flex flex-wrap gap-2">
            {allTags.slice(0, 20).map((tag) => (
              <Link
                key={tag}
                href={`/tag/${tag}`}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 transition-colors hover:bg-primary/10 hover:text-primary dark:bg-primary/10 dark:text-slate-400 dark:hover:bg-primary/20 dark:hover:text-primary-300"
              >
                {tag}
              </Link>
            ))}
          </div>
        </SidebarWidget>
      )}
    </aside>
  );
}

function SidebarWidget({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-card p-4">
      <h3 className="mb-3 flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        <span className="material-symbols-outlined text-[16px] text-primary">
          {icon}
        </span>
        {title}
      </h3>
      {children}
    </div>
  );
}

function CategoryTree({
  categoryCounts,
}: {
  categoryCounts: Record<string, number>;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleGroup = (slug: string) => {
    setExpanded((prev) => ({ ...prev, [slug]: !prev[slug] }));
  };

  const getCount = (slug: string): number => {
    let count = categoryCounts[slug] || 0;
    const group = CATEGORY_GROUPS.find((g) => g.slug === slug);
    if (group?.children) {
      for (const child of group.children) {
        count += categoryCounts[child.slug] || 0;
      }
    }
    return count;
  };

  return (
    <ul className="space-y-1">
      {CATEGORY_GROUPS.map((group) => {
        const groupCount = getCount(group.slug);
        const isExpanded = expanded[group.slug] ?? false;
        const hasChildren = group.children && group.children.length > 0;

        return (
          <li key={group.slug}>
            <div className="flex items-center">
              {hasChildren && (
                <button
                  onClick={() => toggleGroup(group.slug)}
                  className="mr-1 rounded p-0.5 text-slate-400 transition-colors hover:text-primary"
                  aria-label={isExpanded ? "Collapse" : "Expand"}
                >
                  <span
                    className={`material-symbols-outlined text-[16px] transition-transform ${isExpanded ? "rotate-90" : ""}`}
                  >
                    chevron_right
                  </span>
                </button>
              )}
              <Link
                href={`/category/${group.slug}`}
                className={`flex-1 rounded-lg px-2 py-1.5 text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-primary/10 ${!hasChildren ? "ml-6" : ""}`}
              >
                {group.name}
                {groupCount > 0 && (
                  <span className="ml-1 text-xs text-slate-400">
                    ({groupCount})
                  </span>
                )}
              </Link>
            </div>
            {hasChildren && isExpanded && (
              <ul className="ml-6 mt-0.5 space-y-0.5">
                {group.children!.map((child) => (
                  <li key={child.slug}>
                    <Link
                      href={`/category/${child.slug}`}
                      className="block rounded-lg px-2 py-1 text-sm text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-primary/10 dark:hover:text-slate-300"
                    >
                      {child.name}
                      {(categoryCounts[child.slug] || 0) > 0 && (
                        <span className="ml-1 text-xs text-slate-400">
                          ({categoryCounts[child.slug]})
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}
