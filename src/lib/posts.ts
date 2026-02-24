import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { Post, PostMeta, Frontmatter } from "@/types/post";
import { getParentCategory } from "@/lib/constants";

const POSTS_DIR = path.join(process.cwd(), "content/posts");

function getFilesRecursively(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getFilesRecursively(fullPath));
    } else if (entry.name.endsWith(".mdx") || entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }
  return files;
}

function parsePost(
  filePath: string,
  includeDrafts = false
): Post | null {
  const fileContents = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContents);
  const frontmatter = data as Frontmatter;

  if (frontmatter.draft && !includeDrafts) return null;

  const slug = path.basename(filePath).replace(/\.mdx?$/, "");

  const stats = readingTime(content);

  return {
    slug,
    frontmatter,
    content,
    readingTime: stats.text,
  };
}

export function getAllPosts(includeDrafts = false): Post[] {
  const files = getFilesRecursively(POSTS_DIR);
  const posts = files
    .map((f) => parsePost(f, includeDrafts))
    .filter((post): post is Post => post !== null);

  return posts.sort(
    (a, b) =>
      new Date(b.frontmatter.date).getTime() -
      new Date(a.frontmatter.date).getTime()
  );
}

export function getPostBySlugRaw(slug: string): { frontmatter: Frontmatter; content: string } | null {
  const files = getFilesRecursively(POSTS_DIR);
  for (const filePath of files) {
    const fileName = path.basename(filePath).replace(/\.mdx?$/, "");
    if (fileName === slug) {
      const fileContents = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(fileContents);
      return { frontmatter: data as Frontmatter, content };
    }
  }
  return null;
}

export function findPostFile(slug: string): string | null {
  const files = getFilesRecursively(POSTS_DIR);
  for (const filePath of files) {
    const fileName = path.basename(filePath).replace(/\.mdx?$/, "");
    if (fileName === slug) return filePath;
  }
  return null;
}

export { POSTS_DIR };

export function getAllPostMeta(): PostMeta[] {
  return getAllPosts().map(({ slug, frontmatter, readingTime }) => ({
    slug,
    frontmatter,
    readingTime,
  }));
}

export function getPostBySlug(slug: string): Post | null {
  const files = getFilesRecursively(POSTS_DIR);
  for (const filePath of files) {
    const fileName = path.basename(filePath).replace(/\.mdx?$/, "");
    if (fileName === slug) {
      return parsePost(filePath);
    }
  }
  return null;
}

export function getPostsByCategory(category: string): PostMeta[] {
  return getAllPostMeta().filter((post) => {
    const postCat = post.frontmatter.category;
    if (postCat === category) return true;
    // Also match parent category
    const parent = getParentCategory(postCat);
    return parent === category;
  });
}

export function getPostsByTag(tag: string): PostMeta[] {
  return getAllPostMeta().filter((post) =>
    post.frontmatter.tags.includes(tag)
  );
}

export function getAllTags(): string[] {
  const tags = new Set<string>();
  for (const post of getAllPostMeta()) {
    for (const tag of post.frontmatter.tags) {
      tags.add(tag);
    }
  }
  return Array.from(tags).sort();
}

export function getCategoryCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const post of getAllPostMeta()) {
    const cat = post.frontmatter.category;
    counts[cat] = (counts[cat] || 0) + 1;
  }
  return counts;
}

export function getRelatedPosts(
  currentSlug: string,
  limit = 3
): PostMeta[] {
  const current = getPostBySlug(currentSlug);
  if (!current) return [];

  const all = getAllPostMeta().filter((p) => p.slug !== currentSlug);

  const scored = all.map((post) => {
    let score = 0;
    if (post.frontmatter.category === current.frontmatter.category) score += 3;
    const commonTags = post.frontmatter.tags.filter((t) =>
      current.frontmatter.tags.includes(t)
    );
    score += commonTags.length * 2;
    return { post, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.post);
}

export function getFeaturedPosts(): PostMeta[] {
  return getAllPostMeta().filter((post) => post.frontmatter.featured);
}
