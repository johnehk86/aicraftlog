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

      {/* Hero - Featured Post */}
      {featuredPosts.length > 0 && (
        <section className="px-4 py-4">
          <PostCard post={featuredPosts[0]} variant="featured" />
        </section>
      )}

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
