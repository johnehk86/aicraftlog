"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", icon: "home", label: "Home" },
  { href: "/blog", icon: "explore", label: "Explore" },
  { href: "/search", icon: "search", label: "Search" },
  { href: "/category/ai", icon: "smart_toy", label: "AI" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-slate-200 bg-bg-light/90 px-6 pb-6 pt-3 backdrop-blur-lg dark:border-primary/20 dark:bg-bg-dark/90 md:hidden">
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center justify-center gap-1 ${
              isActive
                ? "text-primary"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">
              {item.icon}
            </span>
            <p className="text-[10px] font-semibold tracking-wide">
              {item.label}
            </p>
          </Link>
        );
      })}
    </nav>
  );
}
