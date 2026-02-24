import { Metadata } from "next";
import { getAllPostMeta, getCategoryCounts, getAllTags } from "@/lib/posts";
import { SITE_CONFIG } from "@/lib/constants";
import PostList from "@/components/blog/PostList";
import Sidebar from "@/components/layout/Sidebar";

export const metadata: Metadata = {
  title: "Blog",
  description: `All posts from ${SITE_CONFIG.title}`,
  alternates: {
    canonical: `${SITE_CONFIG.url}/blog`,
  },
};

export default function BlogPage() {
  const posts = getAllPostMeta();
  const categoryCounts = getCategoryCounts();
  const allTags = getAllTags();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Blog</h1>
      <div className="flex gap-8">
        <div className="min-w-0 flex-1">
          <PostList posts={posts} />
        </div>
        <div className="hidden w-72 shrink-0 lg:block">
          <Sidebar
            recentPosts={posts.slice(0, 5)}
            allTags={allTags}
            categoryCounts={categoryCounts}
          />
        </div>
      </div>
    </div>
  );
}
