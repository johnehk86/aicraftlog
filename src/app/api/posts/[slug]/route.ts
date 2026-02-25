import { NextRequest, NextResponse } from "next/server";
import {
  listPostFiles,
  getFileContent,
  updateFile,
  deleteFile,
} from "@/lib/github";
import {
  parseFrontmatter,
  serializeFrontmatter,
  calculateReadingTime,
} from "@/lib/frontmatter-edge";

export const runtime = "edge";

/** Find a post file by slug from the GitHub tree. */
async function findPostFile(slug: string) {
  const files = await listPostFiles();
  return files.find((f) => f.name.replace(/\.mdx?$/, "") === slug) || null;
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const file = await findPostFile(slug);
    if (!file) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const { content: raw, sha } = await getFileContent(file.path);
    const { frontmatter, content } = parseFrontmatter(raw);

    return NextResponse.json({
      slug,
      frontmatter,
      content,
      readingTime: calculateReadingTime(content),
      _sha: sha,
      _path: file.path,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const body = await request.json();

    const file = await findPostFile(slug);
    if (!file) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Get current SHA for update
    const { sha } = await getFileContent(file.path);

    const mdxContent = serializeFrontmatter(
      body.frontmatter,
      body.content || ""
    );

    await updateFile(
      file.path,
      mdxContent,
      sha,
      `Update post: ${body.frontmatter.title || slug}`
    );

    return NextResponse.json({ success: true, slug });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    const file = await findPostFile(slug);
    if (!file) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const { sha } = await getFileContent(file.path);

    await deleteFile(file.path, sha, `Delete post: ${slug}`);

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
