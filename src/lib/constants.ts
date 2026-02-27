import { CategoryGroup } from "@/types/post";

export const SITE_CONFIG = {
  title: "AI Craft Log",
  description:
    "A tech blog covering AI development, web development, and tool reviews for developers",
  url: "https://aicraftlog.com",
  author: "AI Craft Log",
  language: "en",
  postsPerPage: 10,
};

export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    name: "Build Log",
    slug: "build-log",
  },
  {
    name: "AI Tools",
    slug: "ai-tools",
  },
  {
    name: "Tutorial",
    slug: "tutorial",
  },
];

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Blog", href: "/blog" },
  { label: "Build Log", href: "/category/build-log" },
  { label: "AI Tools", href: "/category/ai-tools" },
  { label: "Tutorial", href: "/category/tutorial" },
];

export function getCategoryName(slug: string): string {
  for (const group of CATEGORY_GROUPS) {
    if (group.slug === slug) return group.name;
    if (group.children) {
      for (const child of group.children) {
        if (child.slug === slug) return child.name;
      }
    }
  }
  return slug;
}

export function getAllCategorySlugs(): string[] {
  const slugs: string[] = [];
  for (const group of CATEGORY_GROUPS) {
    slugs.push(group.slug);
    if (group.children) {
      for (const child of group.children) {
        slugs.push(child.slug);
      }
    }
  }
  return slugs;
}

const DEFAULT_THUMBNAILS: Record<string, string> = {
  "build-log":
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
  "ai-tools":
    "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
  tutorial:
    "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&q=80",
  default:
    "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80",
};

export function getDefaultThumbnail(category: string): string {
  return DEFAULT_THUMBNAILS[category] || DEFAULT_THUMBNAILS.default;
}

export function getParentCategory(childSlug: string): string | null {
  for (const group of CATEGORY_GROUPS) {
    if (group.children) {
      for (const child of group.children) {
        if (child.slug === childSlug) return group.slug;
      }
    }
  }
  return null;
}
