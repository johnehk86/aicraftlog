import Link from "next/link";
import { Frontmatter } from "@/types/post";
import { formatDate } from "@/lib/utils";
import { getCategoryName } from "@/lib/constants";
import PostViewCount from "./PostViewCount";

interface PostHeaderProps {
  frontmatter: Frontmatter;
  readingTime: string;
  slug: string;
}

export default function PostHeader({
  frontmatter,
  readingTime,
  slug,
}: PostHeaderProps) {
  return (
    <header className="mb-8 border-b border-slate-200 pb-8 dark:border-primary/10">
      <div className="mb-3 flex items-center gap-2">
        <Link
          href={`/category/${frontmatter.category}`}
          className="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary"
        >
          <span className="material-symbols-outlined text-xs">
            auto_awesome
          </span>
          {getCategoryName(frontmatter.category)}
        </Link>
      </div>
      <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
        {frontmatter.title}
      </h1>
      <p className="mb-4 text-lg text-slate-600 dark:text-slate-400">
        {frontmatter.description}
      </p>
      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px]">
            calendar_today
          </span>
          <time dateTime={frontmatter.date}>
            {formatDate(frontmatter.date)}
          </time>
        </div>
        <span className="text-slate-300 dark:text-slate-600">|</span>
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px]">
            schedule
          </span>
          <span>{readingTime}</span>
        </div>
        <span className="text-slate-300 dark:text-slate-600">|</span>
        <PostViewCount slug={slug} />
        {frontmatter.updated && (
          <>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <span>Updated: {formatDate(frontmatter.updated)}</span>
          </>
        )}
      </div>
      {frontmatter.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {frontmatter.tags.map((tag) => (
            <Link
              key={tag}
              href={`/tag/${tag}`}
              className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-500 transition-colors hover:bg-primary/10 hover:text-primary dark:bg-primary/10 dark:text-slate-400 dark:hover:bg-primary/20 dark:hover:text-primary-300"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
