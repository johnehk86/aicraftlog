const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;
const GITHUB_OWNER = process.env.GITHUB_OWNER!;
const GITHUB_REPO = process.env.GITHUB_REPO!;

const API_BASE = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}`;
const POSTS_PATH = "content/posts";

function headers() {
  return {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

// Unicode-safe base64 encode/decode using TextEncoder/TextDecoder
function encodeBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }
  return btoa(binary);
}

function decodeBase64(base64: string): string {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export interface GitHubFile {
  name: string;
  path: string;
  sha: string;
}

/**
 * List all MDX files under content/posts/ using the Git Trees API.
 */
export async function listPostFiles(): Promise<GitHubFile[]> {
  // Get the default branch's latest tree recursively
  const refRes = await fetch(`${API_BASE}/git/ref/heads/main`, {
    headers: headers(),
  });
  if (!refRes.ok) {
    throw new Error(`Failed to get ref: ${refRes.status}`);
  }
  const refData = await refRes.json();
  const commitSha = refData.object.sha;

  const treeRes = await fetch(
    `${API_BASE}/git/trees/${commitSha}?recursive=1`,
    { headers: headers() }
  );
  if (!treeRes.ok) {
    throw new Error(`Failed to get tree: ${treeRes.status}`);
  }
  const treeData = await treeRes.json();

  return treeData.tree
    .filter(
      (item: { path: string; type: string }) =>
        item.type === "blob" &&
        item.path.startsWith(`${POSTS_PATH}/`) &&
        (item.path.endsWith(".mdx") || item.path.endsWith(".md"))
    )
    .map((item: { path: string; sha: string }) => ({
      name: item.path.split("/").pop()!,
      path: item.path,
      sha: item.sha,
    }));
}

/**
 * Get file content and SHA by path using the Contents API.
 */
export async function getFileContent(
  path: string
): Promise<{ content: string; sha: string }> {
  const res = await fetch(`${API_BASE}/contents/${path}`, {
    headers: headers(),
  });
  if (!res.ok) {
    throw new Error(`Failed to get file ${path}: ${res.status}`);
  }
  const data = await res.json();
  // GitHub returns base64-encoded content (may contain newlines)
  const content = decodeBase64(data.content.replace(/\n/g, ""));
  return { content, sha: data.sha };
}

/**
 * Create a new file via the Contents API.
 */
export async function createFile(
  path: string,
  content: string,
  message: string
): Promise<{ sha: string }> {
  const res = await fetch(`${API_BASE}/contents/${path}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({
      message,
      content: encodeBase64(content),
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `Failed to create file ${path}: ${res.status} ${err.message || ""}`
    );
  }
  const data = await res.json();
  return { sha: data.content.sha };
}

/**
 * Update an existing file via the Contents API.
 */
export async function updateFile(
  path: string,
  content: string,
  sha: string,
  message: string
): Promise<{ sha: string }> {
  const res = await fetch(`${API_BASE}/contents/${path}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({
      message,
      content: encodeBase64(content),
      sha,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `Failed to update file ${path}: ${res.status} ${err.message || ""}`
    );
  }
  const data = await res.json();
  return { sha: data.content.sha };
}

/**
 * Delete a file via the Contents API.
 */
export async function deleteFile(
  path: string,
  sha: string,
  message: string
): Promise<void> {
  const res = await fetch(`${API_BASE}/contents/${path}`, {
    method: "DELETE",
    headers: headers(),
    body: JSON.stringify({
      message,
      sha,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `Failed to delete file ${path}: ${res.status} ${err.message || ""}`
    );
  }
}
