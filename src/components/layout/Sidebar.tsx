import Link from "next/link";
import { PostMeta } from "@/types/post";

interface SidebarProps {
  recentPosts?: PostMeta[];
  allTags?: string[];
  categoryCounts?: Record<string, number>;
}

export default function Sidebar({
  recentPosts = [],
  allTags = [],
}: SidebarProps) {
  return (
    <aside className="space-y-6">
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
