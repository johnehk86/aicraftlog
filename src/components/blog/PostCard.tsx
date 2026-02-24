import Link from "next/link";
import Image from "next/image";
import { PostMeta } from "@/types/post";
import { formatDate } from "@/lib/utils";
import { getCategoryName } from "@/lib/constants";

interface PostCardProps {
  post: PostMeta;
  variant?: "default" | "featured";
}

const categoryColors: Record<string, string> = {
  claude: "text-primary bg-primary/10",
  chatgpt: "text-emerald-500 bg-emerald-500/10",
  "ai-coding": "text-violet-500 bg-violet-500/10",
  nextjs: "text-primary bg-primary/10",
  react: "text-sky-500 bg-sky-500/10",
  "web-dev": "text-orange-500 bg-orange-500/10",
  tools: "text-amber-500 bg-amber-500/10",
  devops: "text-rose-500 bg-rose-500/10",
  ai: "text-primary bg-primary/10",
};

function getCategoryColor(slug: string) {
  return categoryColors[slug] || "text-primary bg-primary/10";
}

export default function PostCard({ post, variant = "default" }: PostCardProps) {
  const { slug, frontmatter, readingTime } = post;

  if (variant === "featured") {
    return (
      <article className="group relative overflow-hidden rounded-xl aspect-[16/10] flex flex-col justify-end">
        {frontmatter.thumbnail ? (
          <Image
            src={frontmatter.thumbnail}
            alt={frontmatter.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-bg-dark/20 to-transparent" />
        <Link href={`/blog/${slug}`} className="relative p-6">
          <div
            className={`mb-3 inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${getCategoryColor(frontmatter.category)}`}
          >
            <span className="material-symbols-outlined text-xs">
              auto_awesome
            </span>
            {getCategoryName(frontmatter.category)}
          </div>
          <h2 className="mb-2 text-2xl font-bold leading-tight text-white">
            {frontmatter.title}
          </h2>
          <p className="text-sm text-slate-300 line-clamp-2">
            {frontmatter.description}
          </p>
        </Link>
      </article>
    );
  }

  return (
    <article className="glass-card group flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
      {frontmatter.thumbnail && (
        <Link
          href={`/blog/${slug}`}
          className="relative block h-48 w-full overflow-hidden"
        >
          <Image
            src={frontmatter.thumbnail}
            alt={frontmatter.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          <span className="absolute right-3 top-3 rounded-md bg-black/60 px-2 py-1 text-[10px] font-bold uppercase text-white backdrop-blur-md">
            {readingTime}
          </span>
        </Link>
      )}
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center gap-2">
          <Link
            href={`/category/${frontmatter.category}`}
            className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${getCategoryColor(frontmatter.category)}`}
          >
            {getCategoryName(frontmatter.category)}
          </Link>
        </div>
        <Link href={`/blog/${slug}`}>
          <h2 className="mb-2 text-lg font-bold leading-snug text-slate-900 group-hover:text-primary dark:text-slate-100 dark:group-hover:text-primary-400 line-clamp-2">
            {frontmatter.title}
          </h2>
        </Link>
        <p className="mb-4 flex-1 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
          {frontmatter.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary">
              <span className="material-symbols-outlined text-[14px]">
                person
              </span>
            </div>
            <time
              dateTime={frontmatter.date}
              className="text-xs text-slate-500"
            >
              {formatDate(frontmatter.date)}
            </time>
          </div>
          <Link
            href={`/blog/${slug}`}
            className="flex items-center gap-1 text-sm font-bold text-primary"
          >
            Read
            <span className="material-symbols-outlined text-sm">
              arrow_forward
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
}
