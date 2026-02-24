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
