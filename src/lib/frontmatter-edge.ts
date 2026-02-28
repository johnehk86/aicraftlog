import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import type { Frontmatter } from "@/types/post";

/**
 * Parse frontmatter from MDX file content (Edge-compatible, no Node.js deps).
 */
export function parseFrontmatter(raw: string): {
  frontmatter: Frontmatter;
  content: string;
} {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    return {
      frontmatter: {
        title: "",
        description: "",
        date: "",
        category: "",
        tags: [],
      },
      content: raw,
    };
  }

  const frontmatter = parseYaml(match[1]) as Frontmatter;
  const content = match[2];
  return { frontmatter, content };
}

/**
 * Serialize frontmatter + content into an MDX string.
 */
export function serializeFrontmatter(
  frontmatter: Frontmatter,
  content: string
): string {
  // Build a clean frontmatter object (omit undefined/false optional fields)
  const fm: Record<string, unknown> = {
    title: frontmatter.title,
    description: frontmatter.description,
    date: frontmatter.date,
    category: frontmatter.category,
    tags: frontmatter.tags,
  };
  if (frontmatter.updated) fm.updated = frontmatter.updated;
  if (frontmatter.thumbnail) fm.thumbnail = frontmatter.thumbnail;
  if (frontmatter.featured) fm.featured = frontmatter.featured;
  if (frontmatter.draft) fm.draft = frontmatter.draft;
  if (frontmatter.publishDate) fm.publishDate = frontmatter.publishDate;

  const yaml = stringifyYaml(fm, { lineWidth: 0 }).trimEnd();
  return `---\n${yaml}\n---\n\n${content}`;
}

/**
 * Estimate reading time from content text.
 */
export function calculateReadingTime(content: string): string {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}
