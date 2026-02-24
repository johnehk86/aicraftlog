import Link from "next/link";
import { SITE_CONFIG } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="hidden border-t border-slate-200 bg-white dark:border-primary/10 dark:bg-bg-dark md:block">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <span>&copy; {new Date().getFullYear()}</span>
            <Link
              href="/"
              className="font-semibold text-slate-700 hover:text-primary dark:text-slate-300 dark:hover:text-primary-400"
            >
              {SITE_CONFIG.title}
            </Link>
            <span>All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <Link
              href="/blog"
              className="transition-colors hover:text-primary dark:hover:text-primary-400"
            >
              Blog
            </Link>
            <Link
              href="/feed.xml"
              className="transition-colors hover:text-primary dark:hover:text-primary-400"
            >
              RSS
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-primary dark:hover:text-primary-400"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
