import { Metadata } from "next";
import {
  getPostsByTag,
  getAllTags,
  getCategoryCounts,
  getAllPostMeta,
} from "@/lib/posts";
import { SITE_CONFIG } from "@/lib/constants";
import PostList from "@/components/blog/PostList";
import Sidebar from "@/components/layout/Sidebar";

export const runtime = "edge";
export const dynamicParams = false;

interface PageProps {
  params: Promise<{ tag: string }>;
}

export async function generateStaticParams() {
  return getAllTags().map((tag) => ({ tag }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  return {
    title: `#${decodedTag} Tag`,
    description: `Posts tagged with ${decodedTag} - ${SITE_CONFIG.title}`,
    alternates: {
      canonical: `${SITE_CONFIG.url}/tag/${tag}`,
    },
  };
}

export default async function TagPage({ params }: PageProps) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const posts = getPostsByTag(decodedTag);
  const categoryCounts = getCategoryCounts();
  const allTags = getAllTags();
  const allPosts = getAllPostMeta();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <div className="mb-2 inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
          <span className="material-symbols-outlined text-xs">tag</span>
          Tag
        </div>
        <h1 className="text-3xl font-bold tracking-tight">#{decodedTag}</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          {posts.length} {posts.length === 1 ? "post" : "posts"}
        </p>
      </div>
      <div className="flex gap-8">
        <div className="min-w-0 flex-1">
          <PostList posts={posts} />
        </div>
        <div className="hidden w-72 shrink-0 lg:block">
          <Sidebar
            recentPosts={allPosts.slice(0, 5)}
            allTags={allTags}
            categoryCounts={categoryCounts}
          />
        </div>
      </div>
    </div>
  );
}
