import { NextRequest, NextResponse } from "next/server";
import { getFileContent, updateFile, createFile } from "@/lib/github";

export const runtime = "edge";

const NAV_LINKS_PATH = "content/nav-links.json";

export async function GET() {
  try {
    const { content } = await getFileContent(NAV_LINKS_PATH);
    const navLinks = JSON.parse(content);
    return NextResponse.json(navLinks);
  } catch {
    return NextResponse.json([]);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const navLinks = await request.json();

    if (!Array.isArray(navLinks)) {
      return NextResponse.json(
        { error: "Nav links must be an array" },
        { status: 400 }
      );
    }

    const content = JSON.stringify(navLinks, null, 2) + "\n";

    try {
      const { sha } = await getFileContent(NAV_LINKS_PATH);
      await updateFile(NAV_LINKS_PATH, content, sha, "Update nav links");
    } catch {
      await createFile(NAV_LINKS_PATH, content, "Create nav links");
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
