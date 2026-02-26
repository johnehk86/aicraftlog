/* eslint-disable @next/next/no-page-custom-font */
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = searchParams.get("title") || "AI Craft Log";
  const category = searchParams.get("category") || "";
  const description = searchParams.get("description") || "";

  const fontData = await fetch(
    "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&display=swap"
  ).then((res) => res.text());

  const fontUrl = fontData.match(
    /src: url\((.+?)\) format\('woff2'\)/
  )?.[1];

  let fontBuffer: ArrayBuffer | undefined;
  if (fontUrl) {
    fontBuffer = await fetch(fontUrl).then((res) => res.arrayBuffer());
  }

  const fonts: { name: string; data: ArrayBuffer; style: "normal"; weight: 700 }[] = [];
  if (fontBuffer) {
    fonts.push({
      name: "Space Grotesk",
      data: fontBuffer,
      style: "normal" as const,
      weight: 700 as const,
    });
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 70px",
          background: "linear-gradient(135deg, #101622 0%, #1a2744 100%)",
          fontFamily: fontBuffer ? "'Space Grotesk', sans-serif" : "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles - right side */}
        <svg
          width="400"
          height="400"
          viewBox="0 0 400 400"
          style={{
            position: "absolute",
            right: "-40px",
            bottom: "-40px",
          }}
        >
          <circle
            cx="200"
            cy="200"
            r="180"
            fill="none"
            stroke="rgba(100, 140, 200, 0.15)"
            strokeWidth="1.5"
          />
          <circle
            cx="200"
            cy="200"
            r="140"
            fill="none"
            stroke="rgba(100, 140, 200, 0.12)"
            strokeWidth="1.5"
          />
          <circle
            cx="200"
            cy="200"
            r="100"
            fill="none"
            stroke="rgba(100, 140, 200, 0.09)"
            strokeWidth="1.5"
          />
          <circle
            cx="200"
            cy="200"
            r="60"
            fill="none"
            stroke="rgba(100, 140, 200, 0.06)"
            strokeWidth="1.5"
          />
        </svg>

        {/* Top section: category badge */}
        <div style={{ display: "flex" }}>
          {category && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#3B82F6",
                color: "#FFFFFF",
                fontSize: "16px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "2px",
                padding: "8px 20px",
                borderRadius: "6px",
              }}
            >
              {category}
            </div>
          )}
        </div>

        {/* Middle section: title + description */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            maxWidth: "900px",
          }}
        >
          <div
            style={{
              fontSize: title.length > 40 ? "48px" : "56px",
              fontWeight: 700,
              color: "#FFFFFF",
              lineHeight: 1.15,
              letterSpacing: "-1px",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {title}
          </div>
          {description && (
            <div
              style={{
                fontSize: "22px",
                color: "#94A3B8",
                lineHeight: 1.4,
                display: "-webkit-box",
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {description}
            </div>
          )}
        </div>

        {/* Bottom section: branding */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "200px",
              height: "3px",
              background: "#3B82F6",
              borderRadius: "2px",
            }}
          />
          <div
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "#94A3B8",
              letterSpacing: "4px",
              textTransform: "uppercase",
            }}
          >
            AI CRAFT LOG
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: fonts.length > 0 ? fonts : undefined,
    }
  );
}
