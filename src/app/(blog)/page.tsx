import Link from "next/link";
import {
  getAllPostMeta,
  getFeaturedPosts,
  getCategoryCounts,
  getAllTags,
} from "@/lib/posts";
import PostCard from "@/components/blog/PostCard";
import Sidebar from "@/components/layout/Sidebar";
import { SITE_CONFIG, CATEGORY_GROUPS } from "@/lib/constants";

export default function HomePage() {
  const allPosts = getAllPostMeta();
  const featuredPosts = getFeaturedPosts();
  const recentPosts = allPosts.slice(0, 6);
  const categoryCounts = getCategoryCounts();
  const allTags = getAllTags();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-primary/30 dark:from-bg-dark dark:via-slate-900 dark:to-primary/20">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Glow */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-primary/20 blur-[100px]" />

        <div className="relative flex flex-col items-center justify-center px-6 py-20 text-center">
          {/* Logo mark */}
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              className="text-primary"
            >
              <path
                d="M16 2L4 9v14l12 7 12-7V9L16 2z"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
              />
              <path
                d="M16 2v14m0 0l12-7m-12 7L4 9m12 7v14"
                stroke="currentColor"
                strokeWidth="1.5"
                opacity="0.5"
              />
              <circle cx="16" cy="16" r="3" fill="currentColor" opacity="0.8" />
            </svg>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-[0.2em] uppercase font-display text-white mb-3">
            AI Craft Log
          </h1>
          <p className="text-slate-400 text-sm tracking-wide max-w-xs">
            Experiments in the age of intelligence
          </p>
        </div>
      </section>

      {/* Category Filters */}
      <nav className="hide-scrollbar flex gap-3 overflow-x-auto px-4 py-2">
        <Link
          href="/blog"
          className="flex h-9 shrink-0 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-white"
        >
          All
        </Link>
        {CATEGORY_GROUPS.map((group) => (
          <Link
            key={group.slug}
            href={`/category/${group.slug}`}
            className="flex h-9 shrink-0 items-center justify-center rounded-full bg-slate-200 px-5 text-sm font-medium text-slate-700 transition-colors hover:bg-primary hover:text-white dark:bg-primary/10 dark:text-primary dark:hover:bg-primary dark:hover:text-white"
          >
            {group.name}
          </Link>
        ))}
      </nav>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex gap-8">
          <div className="min-w-0 flex-1">
            {/* Latest Insights */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Latest Insights
                </h3>
                <Link
                  href="/blog"
                  className="text-sm font-medium text-primary"
                >
                  View All
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {recentPosts.map((post) => (
                  <PostCard key={post.slug} post={post} />
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar - desktop only */}
          <div className="hidden w-72 shrink-0 lg:block">
            <Sidebar
              recentPosts={allPosts.slice(0, 5)}
              popularPosts={featuredPosts.slice(0, 5)}
              allTags={allTags}
              categoryCounts={categoryCounts}
            />
          </div>
        </div>
      </div>
    </>
  );
}
