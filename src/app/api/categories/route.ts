import { NextRequest, NextResponse } from "next/server";
import { getFileContent, updateFile, createFile } from "@/lib/github";

export const runtime = "edge";

const CATEGORIES_PATH = "content/categories.json";

export async function GET() {
  try {
    const { content } = await getFileContent(CATEGORIES_PATH);
    const categories = JSON.parse(content);
    return NextResponse.json(categories);
  } catch {
    // Return default categories if file doesn't exist
    return NextResponse.json([]);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const categories = await request.json();

    if (!Array.isArray(categories)) {
      return NextResponse.json(
        { error: "Categories must be an array" },
        { status: 400 }
      );
    }

    const content = JSON.stringify(categories, null, 2) + "\n";

    try {
      const { sha } = await getFileContent(CATEGORIES_PATH);
      await updateFile(
        CATEGORIES_PATH,
        content,
        sha,
        "Update categories"
      );
    } catch {
      // File doesn't exist yet, create it
      await createFile(CATEGORIES_PATH, content, "Create categories");
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
