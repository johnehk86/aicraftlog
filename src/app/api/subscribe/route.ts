export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const apiKey = process.env.BUTTONDOWN_API_KEY;
    if (!apiKey) {
      console.error("BUTTONDOWN_API_KEY is not configured");
      return NextResponse.json(
        { error: "Newsletter service is not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://api.buttondown.email/v1/subscribers",
      {
        method: "POST",
        headers: {
          Authorization: `Token ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email_address: email }),
      }
    );

    if (response.status === 201) {
      return NextResponse.json({ success: true });
    }

    if (response.status === 400) {
      const data = await response.json();
      // Buttondown returns array of error messages or object with email errors
      if (
        JSON.stringify(data).toLowerCase().includes("already") ||
        JSON.stringify(data).toLowerCase().includes("subscriber")
      ) {
        return NextResponse.json(
          { error: "This email is already subscribed" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to subscribe. Please try again later." },
      { status: 500 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Subscribe error:", message);
    return NextResponse.json(
      { error: "Failed to subscribe. Please try again later." },
      { status: 500 }
    );
  }
}
