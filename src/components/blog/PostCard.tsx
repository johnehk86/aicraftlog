import Link from "next/link";
import { PostMeta } from "@/types/post";
import { formatDate } from "@/lib/utils";
import { getCategoryName } from "@/lib/constants";

interface PostCardProps {
  post: PostMeta;
  variant?: "default" | "featured";
}

const categoryColors: Record<string, string> = {
  "build-log": "text-violet-500 bg-violet-500/10",
  "ai-tools": "text-primary bg-primary/10",
  tutorial: "text-emerald-500 bg-emerald-500/10",
};

function getCategoryColor(slug: string) {
  return categoryColors[slug] || "text-primary bg-primary/10";
}

export default function PostCard({ post, variant = "default" }: PostCardProps) {
  const { slug, frontmatter, readingTime } = post;

  if (variant === "featured") {
    return (
      <article className="glass-card group overflow-hidden transition-shadow hover:shadow-lg hover:shadow-blue-500/5">
        <Link href={`/blog/${slug}`} className="block p-5 sm:p-6">
          <div className="mb-3 flex items-center gap-3">
            <span
              className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${getCategoryColor(frontmatter.category)}`}
            >
              {getCategoryName(frontmatter.category)}
            </span>
            <span className="text-xs text-slate-400">{readingTime}</span>
          </div>
          <h2 className="mb-2 text-xl font-bold leading-snug text-slate-900 group-hover:text-primary dark:text-slate-100 dark:group-hover:text-primary-400 sm:text-2xl">
            {frontmatter.title}
          </h2>
          <p className="mb-3 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
            {frontmatter.description}
          </p>
          <time
            dateTime={frontmatter.date}
            className="text-xs text-slate-500"
          >
            {formatDate(frontmatter.date)}
          </time>
        </Link>
      </article>
    );
  }

  return (
    <article className="glass-card group overflow-hidden transition-shadow hover:shadow-lg hover:shadow-blue-500/5">
      <Link href={`/blog/${slug}`} className="block p-4 sm:p-5">
        <div className="mb-2 flex items-center gap-3">
          <span
            className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${getCategoryColor(frontmatter.category)}`}
          >
            {getCategoryName(frontmatter.category)}
          </span>
          <span className="text-xs text-slate-400">{readingTime}</span>
        </div>
        <h2 className="mb-2 text-base font-bold leading-snug text-slate-900 group-hover:text-primary dark:text-slate-100 dark:group-hover:text-primary-400 line-clamp-2 sm:text-xl">
          {frontmatter.title}
        </h2>
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
          {frontmatter.description}
        </p>
        <time
          dateTime={frontmatter.date}
          className="text-xs text-slate-500"
        >
          {formatDate(frontmatter.date)}
        </time>
      </Link>
    </article>
  );
}
