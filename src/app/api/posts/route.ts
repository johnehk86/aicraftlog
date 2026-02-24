import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getAllPosts, POSTS_DIR } from "@/lib/posts";
import { revalidatePath } from "next/cache";

const SLUG_REGEX = /^[a-z0-9-]+$/;

export async function GET() {
  const posts = getAllPosts(true);
  const list = posts.map((p) => ({
    slug: p.slug,
    title: p.frontmatter.title,
    date: p.frontmatter.date,
    category: p.frontmatter.category,
    draft: p.frontmatter.draft ?? false,
  }));
  return NextResponse.json(list);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { slug, frontmatter, content } = body;

  if (!slug || !SLUG_REGEX.test(slug)) {
    return NextResponse.json(
      { error: "Invalid slug. Use lowercase letters, numbers, and hyphens only." },
      { status: 400 }
    );
  }

  const year = new Date().getFullYear().toString();
  const dir = path.join(POSTS_DIR, year);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const filePath = path.join(dir, `${slug}.mdx`);
  if (fs.existsSync(filePath)) {
    return NextResponse.json(
      { error: "A post with this slug already exists." },
      { status: 409 }
    );
  }

  const mdxContent = buildMdxContent(frontmatter, content);
  fs.writeFileSync(filePath, mdxContent, "utf-8");

  revalidatePath("/");
  revalidatePath("/blog");

  return NextResponse.json({ success: true, slug }, { status: 201 });
}

function buildMdxContent(
  frontmatter: Record<string, unknown>,
  content: string
): string {
  const lines = ["---"];
  lines.push(`title: "${escapeFrontmatter(String(frontmatter.title || ""))}"`);
  lines.push(
    `description: "${escapeFrontmatter(String(frontmatter.description || ""))}"`
  );
  lines.push(`date: "${frontmatter.date || new Date().toISOString().split("T")[0]}"`);
  lines.push(`category: "${frontmatter.category || ""}"`);

  const tags = Array.isArray(frontmatter.tags) ? frontmatter.tags : [];
  lines.push(`tags: [${tags.map((t: string) => `"${escapeFrontmatter(t)}"`).join(", ")}]`);

  if (frontmatter.thumbnail) {
    lines.push(`thumbnail: "${frontmatter.thumbnail}"`);
  }
  if (frontmatter.featured) {
    lines.push(`featured: true`);
  }
  if (frontmatter.draft) {
    lines.push(`draft: true`);
  }

  lines.push("---");
  lines.push("");
  lines.push(content || "");

  return lines.join("\n");
}

function escapeFrontmatter(str: string): string {
  return str.replace(/"/g, '\\"');
}
