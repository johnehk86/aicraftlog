import Link from "next/link";
import { SITE_CONFIG } from "@/lib/constants";
import NewsletterSubscribe from "@/components/common/NewsletterSubscribe";

export default function Footer() {
  return (
    <footer className="hidden border-t border-slate-200 bg-white dark:border-primary/10 dark:bg-bg-dark md:block">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col gap-6">
          <div className="mx-auto w-full max-w-md">
            <NewsletterSubscribe />
          </div>
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
                href="/about"
                className="transition-colors hover:text-primary dark:hover:text-primary-400"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="transition-colors hover:text-primary dark:hover:text-primary-400"
              >
                Contact
              </Link>
              <Link
                href="/feed.xml"
                className="transition-colors hover:text-primary dark:hover:text-primary-400"
              >
                RSS
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 text-xs text-slate-400 dark:text-slate-500">
            <Link
              href="/privacy"
              className="transition-colors hover:text-primary dark:hover:text-primary-400"
            >
              Privacy Policy
            </Link>
            <span>|</span>
            <Link
              href="/terms"
              className="transition-colors hover:text-primary dark:hover:text-primary-400"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
