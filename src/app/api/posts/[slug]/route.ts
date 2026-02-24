import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import { getPostBySlugRaw, findPostFile } from "@/lib/posts";
import { revalidatePath } from "next/cache";

const SLUG_REGEX = /^[a-z0-9-]+$/;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!SLUG_REGEX.test(slug)) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  const post = getPostBySlugRaw(slug);
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json(post);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!SLUG_REGEX.test(slug)) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  const filePath = findPostFile(slug);
  if (!filePath) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const body = await request.json();
  const { frontmatter, content } = body;

  const mdxContent = buildMdxContent(frontmatter, content);
  fs.writeFileSync(filePath, mdxContent, "utf-8");

  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!SLUG_REGEX.test(slug)) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  const filePath = findPostFile(slug);
  if (!filePath) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  fs.unlinkSync(filePath);

  revalidatePath("/");
  revalidatePath("/blog");

  return NextResponse.json({ success: true });
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
