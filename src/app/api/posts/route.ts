import { NextRequest, NextResponse } from "next/server";
import { listPostFiles, getFileContent, createFile } from "@/lib/github";
import {
  parseFrontmatter,
  serializeFrontmatter,
  calculateReadingTime,
} from "@/lib/frontmatter-edge";

export const runtime = "edge";

export async function GET() {
  try {
    const files = await listPostFiles();

    // Fetch all file contents in parallel
    const results = await Promise.all(
      files.map(async (file) => {
        try {
          const { content: raw } = await getFileContent(file.path);
          const { frontmatter, content } = parseFrontmatter(raw);
          const slug = file.name.replace(/\.mdx?$/, "");
          return {
            slug,
            title: frontmatter.title,
            date: frontmatter.date,
            category: frontmatter.category,
            draft: frontmatter.draft || false,
            readingTime: calculateReadingTime(content),
          };
        } catch {
          return null;
        }
      })
    );

    const posts = results
      .filter((p) => p !== null)
      .sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

    return NextResponse.json(posts);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, frontmatter, content } = body;

    if (!slug || !frontmatter?.title) {
      return NextResponse.json(
        { error: "slug and frontmatter.title are required" },
        { status: 400 }
      );
    }

    // Determine the year folder from the date
    const year = frontmatter.date
      ? frontmatter.date.substring(0, 4)
      : new Date().getFullYear().toString();
    const filePath = `content/posts/${year}/${slug}.mdx`;

    const mdxContent = serializeFrontmatter(frontmatter, content || "");

    await createFile(filePath, mdxContent, `Add post: ${frontmatter.title}`);

    return NextResponse.json({ success: true, slug });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
