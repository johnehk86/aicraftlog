import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const NOT_AVAILABLE = { error: "This API is only available in development mode" };

export async function GET(
  _request: NextRequest,
  _context: { params: Promise<{ slug: string }> }
) {
  return NextResponse.json(NOT_AVAILABLE, { status: 501 });
}

export async function PUT(
  _request: NextRequest,
  _context: { params: Promise<{ slug: string }> }
) {
  return NextResponse.json(NOT_AVAILABLE, { status: 501 });
}

export async function DELETE(
  _request: NextRequest,
  _context: { params: Promise<{ slug: string }> }
) {
  return NextResponse.json(NOT_AVAILABLE, { status: 501 });
}
