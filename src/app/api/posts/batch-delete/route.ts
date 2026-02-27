import { NextRequest, NextResponse } from "next/server";
import { listPostFiles, deleteMultipleFiles } from "@/lib/github";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const { slugs } = await request.json();

    if (!Array.isArray(slugs) || slugs.length === 0) {
      return NextResponse.json(
        { error: "slugs must be a non-empty array" },
        { status: 400 }
      );
    }

    const files = await listPostFiles();
    const slugSet = new Set(slugs);
    const paths = files
      .filter((f) => slugSet.has(f.name.replace(/\.mdx?$/, "")))
      .map((f) => f.path);

    if (paths.length === 0) {
      return NextResponse.json(
        { error: "No matching posts found" },
        { status: 404 }
      );
    }

    await deleteMultipleFiles(
      paths,
      `Delete ${paths.length} post${paths.length > 1 ? "s" : ""}: ${slugs.join(", ")}`
    );

    return NextResponse.json({ success: true, deleted: paths.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
