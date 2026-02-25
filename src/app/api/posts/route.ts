import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET() {
  return NextResponse.json(
    { error: "This API is only available in development mode" },
    { status: 501 }
  );
}

export async function POST(_request: NextRequest) {
  return NextResponse.json(
    { error: "This API is only available in development mode" },
    { status: 501 }
  );
}
