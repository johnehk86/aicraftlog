import Link from "next/link";
import { PostMeta } from "@/types/post";
import { formatDate } from "@/lib/utils";
import { getCategoryName } from "@/lib/constants";

interface RelatedPostsProps {
  posts: PostMeta[];
}

export default function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-12 border-t border-slate-200 pt-8 dark:border-primary/10">
      <h2 className="mb-6 text-xl font-bold">Related Posts</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="glass-card group p-4 transition-shadow hover:shadow-md"
          >
            <span className="mb-1 block text-[10px] font-bold uppercase text-primary">
              {getCategoryName(post.frontmatter.category)}
            </span>
            <h3 className="mb-2 text-sm font-bold group-hover:text-primary dark:group-hover:text-primary-400 line-clamp-2">
              {post.frontmatter.title}
            </h3>
            <time
              dateTime={post.frontmatter.date}
              className="text-xs text-slate-400"
            >
              {formatDate(post.frontmatter.date)}
            </time>
          </Link>
        ))}
      </div>
    </section>
  );
}
