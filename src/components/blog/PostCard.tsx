import Link from "next/link";
import Image from "next/image";
import { PostMeta } from "@/types/post";
import { formatDate } from "@/lib/utils";
import { getCategoryName, getDefaultThumbnail } from "@/lib/constants";

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
  const thumbnail =
    frontmatter.thumbnail || getDefaultThumbnail(frontmatter.category);

  if (variant === "featured") {
    return (
      <article className="group relative overflow-hidden rounded-2xl aspect-[16/10] flex flex-col justify-end">
        <Image
          src={thumbnail}
          alt={frontmatter.title}
          fill
          className="object-cover"
        />
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
    <article className="glass-card group overflow-hidden transition-shadow hover:shadow-lg hover:shadow-blue-500/5">
      <Link href={`/blog/${slug}`} className="flex flex-row">
        {/* Thumbnail */}
        <div className="relative w-36 shrink-0 sm:w-60">
          <div className="relative aspect-[16/9] h-full w-full overflow-hidden">
            <Image
              src={thumbnail}
              alt={frontmatter.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          </div>
        </div>
        {/* Content */}
        <div className="flex flex-1 flex-col justify-center p-4 sm:p-5">
          <div className="mb-2 flex items-center gap-3">
            <span
              className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${getCategoryColor(frontmatter.category)}`}
            >
              {getCategoryName(frontmatter.category)}
            </span>
            <span className="text-xs text-slate-400">
              {readingTime}
            </span>
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
        </div>
      </Link>
    </article>
  );
}
