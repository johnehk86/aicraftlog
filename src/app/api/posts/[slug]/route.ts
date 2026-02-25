import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const SLUG_REGEX = /^[a-z0-9-]+$/;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!SLUG_REGEX.test(slug)) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }

    const { getPostBySlugRaw } = await import("@/lib/posts");
    const post = getPostBySlugRaw(slug);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch {
    return NextResponse.json(
      { error: "This feature is only available in development" },
      { status: 501 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!SLUG_REGEX.test(slug)) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }

    const fs = (await import("fs")).default;
    const { findPostFile } = await import("@/lib/posts");
    const filePath = findPostFile(slug);
    if (!filePath) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const body = await request.json();
    const { frontmatter, content } = body;

    const mdxContent = buildMdxContent(frontmatter, content);
    fs.writeFileSync(filePath, mdxContent, "utf-8");

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "This feature is only available in development" },
      { status: 501 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!SLUG_REGEX.test(slug)) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }

    const fs = (await import("fs")).default;
    const { findPostFile } = await import("@/lib/posts");
    const filePath = findPostFile(slug);
    if (!filePath) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    fs.unlinkSync(filePath);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "This feature is only available in development" },
      { status: 501 }
    );
  }
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
