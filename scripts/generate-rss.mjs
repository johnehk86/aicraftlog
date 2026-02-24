import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { Feed } from "feed";

const SITE_URL = "https://aicraftlog.com";
const POSTS_DIR = path.join(process.cwd(), "content/posts");
const OUTPUT_PATH = path.join(process.cwd(), "public/feed.xml");

function getFilesRecursively(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
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

function main() {
  const feed = new Feed({
    title: "AI Craft Log",
    description: "A tech blog covering AI development, web development, and tool reviews for developers",
    id: SITE_URL,
    link: SITE_URL,
    language: "en",
    favicon: `${SITE_URL}/favicon.ico`,
    copyright: `All rights reserved ${new Date().getFullYear()}, AI Craft Log`,
    feedLinks: {
      rss2: `${SITE_URL}/feed.xml`,
    },
    author: {
      name: "AI Craft Log",
      link: SITE_URL,
    },
  });

  const files = getFilesRecursively(POSTS_DIR);
  const posts = [];

  for (const filePath of files) {
    const fileContents = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(fileContents);
    if (data.draft) continue;

    const slug = path.basename(filePath).replace(/\.mdx?$/, "");
    posts.push({ slug, ...data });
  }

  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  for (const post of posts.slice(0, 20)) {
    feed.addItem({
      title: post.title,
      id: `${SITE_URL}/blog/${post.slug}`,
      link: `${SITE_URL}/blog/${post.slug}`,
      description: post.description,
      date: new Date(post.date),
      category: post.tags?.map((tag) => ({ name: tag })),
    });
  }

  // Ensure output directory exists
  const outDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_PATH, feed.rss2());
  console.log(`RSS feed generated: ${posts.length} posts`);
}

main();
