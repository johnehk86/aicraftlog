"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { NAV_LINKS } from "@/lib/constants";
import ThemeToggle from "@/components/common/ThemeToggle";
import MobileNav from "@/components/layout/MobileNav";

interface NavLink {
  label: string;
  href: string;
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navLinks, setNavLinks] = useState<NavLink[]>(NAV_LINKS);

  useEffect(() => {
    fetch("/api/nav-links")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setNavLinks(data);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-bg-light/80 backdrop-blur-md dark:border-primary/20 dark:bg-bg-dark/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.jpg" alt="AI Craft Log" className="h-10 w-10 rounded-lg" />
          <span className="text-lg font-bold tracking-tight">
            <span className="text-primary">AI Craft Log</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-primary/10 dark:hover:text-primary-300"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          <Link
            href="/search"
            className="flex items-center justify-center rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-primary/10"
            aria-label="Search"
          >
            <span className="material-symbols-outlined text-[20px]">search</span>
          </Link>
          <ThemeToggle />

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-primary/10 md:hidden"
            aria-label="Menu"
          >
            <span className="material-symbols-outlined text-[20px]">
              {mobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <MobileNav
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        navLinks={navLinks}
      />
    </header>
  );
}
