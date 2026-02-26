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
    name: "AI Dev",
    slug: "ai",
    children: [
      { name: "Claude", slug: "claude" },
      { name: "ChatGPT", slug: "chatgpt" },
      { name: "AI Coding", slug: "ai-coding" },
    ],
  },
  {
    name: "Web Dev",
    slug: "web-dev",
    children: [
      { name: "Next.js", slug: "nextjs" },
      { name: "React", slug: "react" },
    ],
  },
  {
    name: "Tool Reviews",
    slug: "tools",
  },
  {
    name: "DevOps",
    slug: "devops",
  },
];

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Blog", href: "/blog" },
  { label: "AI Dev", href: "/category/ai" },
  { label: "Web Dev", href: "/category/web-dev" },
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
  ai: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
  claude:
    "https://images.unsplash.com/photo-1697577418970-95d99b5a55cf?w=800&q=80",
  chatgpt:
    "https://images.unsplash.com/photo-1684391507090-070814e11aef?w=800&q=80",
  "ai-coding":
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
  "web-dev":
    "https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&q=80",
  nextjs:
    "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&q=80",
  react:
    "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80",
  tools:
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80",
  devops:
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
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
