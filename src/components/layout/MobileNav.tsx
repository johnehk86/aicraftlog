"use client";

import Link from "next/link";
import { NAV_LINKS, CATEGORY_GROUPS } from "@/lib/constants";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  if (!isOpen) return null;

  return (
    <div className="border-t border-slate-200 bg-bg-light dark:border-primary/10 dark:bg-bg-dark md:hidden">
      <nav className="flex flex-col px-4 py-3">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-primary/10"
          >
            {link.label}
          </Link>
        ))}
        <hr className="my-2 border-slate-200 dark:border-primary/10" />
        <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Categories
        </p>
        {CATEGORY_GROUPS.map((group) => (
          <Link
            key={group.slug}
            href={`/category/${group.slug}`}
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-primary/10"
          >
            {group.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}
