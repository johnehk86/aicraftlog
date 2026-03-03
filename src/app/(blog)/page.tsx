import Link from "next/link";
import fs from "fs";
import path from "path";
import {
  getAllPostMeta,
  getCategoryCounts,
  getAllTags,
} from "@/lib/posts";
import PostCard from "@/components/blog/PostCard";
import Sidebar from "@/components/layout/Sidebar";
import { SITE_CONFIG, CATEGORY_GROUPS } from "@/lib/constants";

interface Project {
  title: string;
  description: string;
  url: string;
  icon: string;
  iconColor: string;
  type: "web" | "youtube";
}

const ICON_COLOR_MAP: Record<string, { bg: string; text: string }> = {
  sky: { bg: "bg-sky-100 dark:bg-sky-900/30", text: "text-sky-500" },
  purple: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-500" },
  red: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-500" },
  emerald: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-500" },
  amber: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-500" },
  blue: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-500" },
};

function getProjects(): Project[] {
  const filePath = path.join(process.cwd(), "content", "projects.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

export default function HomePage() {
  const allPosts = getAllPostMeta();
  const recentPosts = allPosts.slice(0, 6);
  const categoryCounts = getCategoryCounts();
  const allTags = getAllTags();
  const projects = getProjects();

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

        <div className="relative flex flex-col items-center justify-center px-6 py-16 text-center">
          {/* Logo */}
          <img
            src="/logo.jpg"
            alt="AI Craft Log"
            width={180}
            height={180}
            className="mb-4 rounded-2xl"
          />
          <p className="text-slate-400 text-base sm:text-lg tracking-wide max-w-md">
            Experiments in the age of intelligence
          </p>
        </div>
      </section>


      {/* Craft Works */}
      <section className="mx-auto max-w-6xl px-4 pt-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-xl">rocket_launch</span>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Craft Works</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => {
            const colors = ICON_COLOR_MAP[project.iconColor] || ICON_COLOR_MAP.blue;
            return (
              <a
                key={project.url}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card group flex items-center gap-4 p-4 transition-all hover:border-primary/40 hover:shadow-md hover:shadow-primary/10"
              >
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${colors.bg}`}>
                  <span className={`material-symbols-outlined ${colors.text}`}>{project.icon}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900 group-hover:text-primary dark:text-white dark:group-hover:text-primary-400 transition-colors text-sm">
                    {project.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {project.description}
                  </p>
                </div>
                <span className="material-symbols-outlined ml-auto text-slate-300 group-hover:text-primary transition-colors dark:text-slate-600 dark:group-hover:text-primary-400 shrink-0">
                  {project.type === "youtube" ? "play_arrow" : "arrow_forward"}
                </span>
              </a>
            );
          })}
        </div>
      </section>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Category Filters - aligned with content */}
        <nav className="hide-scrollbar mb-6 flex gap-3 overflow-x-auto">
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
              <div className="flex flex-col gap-6">
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
              allTags={allTags}
              categoryCounts={categoryCounts}
            />
          </div>
        </div>
      </div>
    </>
  );
}
