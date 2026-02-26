export const runtime = "edge";

const CUSDIS_ORIGIN = "https://cusdis.com";

async function proxy(request: Request, params: Promise<{ path: string[] }>) {
  const { path } = await params;
  const url = new URL(request.url);
  const target = `${CUSDIS_ORIGIN}/${path.join("/")}${url.search}`;

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);

  const res = await fetch(target, {
    method: request.method,
    headers,
    body: request.method !== "GET" && request.method !== "HEAD"
      ? request.body
      : undefined,
  });

  const responseHeaders = new Headers();
  const resContentType = res.headers.get("content-type");
  if (resContentType) responseHeaders.set("content-type", resContentType);
  responseHeaders.set("access-control-allow-origin", "*");
  responseHeaders.set("cache-control", res.headers.get("cache-control") || "public, max-age=3600");

  return new Response(res.body, {
    status: res.status,
    headers: responseHeaders,
  });
}

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(request, params);
}

export async function POST(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(request, params);
}
