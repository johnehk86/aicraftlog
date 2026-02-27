const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const GITHUB_OWNER = process.env.GITHUB_OWNER || "";
const GITHUB_REPO = process.env.GITHUB_REPO || "";

const API_BASE = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}`;
const POSTS_PATH = "content/posts";

function validateEnv() {
  const missing: string[] = [];
  if (!GITHUB_TOKEN) missing.push("GITHUB_TOKEN");
  if (!GITHUB_OWNER) missing.push("GITHUB_OWNER");
  if (!GITHUB_REPO) missing.push("GITHUB_REPO");
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(", ")}`);
  }
}

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
  validateEnv();
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
  validateEnv();
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
 * Create or overwrite a file via the Contents API.
 * If the file already exists, fetches its SHA and updates it.
 */
export async function createFile(
  path: string,
  content: string,
  message: string
): Promise<{ sha: string }> {
  validateEnv();
  const url = `${API_BASE}/contents/${path}`;

  // Check if file already exists to get SHA
  let existingSha: string | undefined;
  const checkRes = await fetch(url, { headers: headers() });
  if (checkRes.ok) {
    const existing = await checkRes.json();
    existingSha = existing.sha;
  }

  const body: Record<string, string> = {
    message,
    content: encodeBase64(content),
  };
  if (existingSha) {
    body.sha = existingSha;
  }

  const res = await fetch(url, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `Failed to create file ${path}: ${res.status} ${err.message || res.statusText}. ` +
        `Repo: ${GITHUB_OWNER}/${GITHUB_REPO}, URL: ${url}`
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
  validateEnv();
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
      `Failed to update file ${path}: ${res.status} ${err.message || res.statusText}`
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
  validateEnv();
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
      `Failed to delete file ${path}: ${res.status} ${err.message || res.statusText}`
    );
  }
}

/**
 * Delete multiple files in a single commit using the Git Data API.
 * This avoids creating one commit per file, reducing build triggers.
 */
export async function deleteMultipleFiles(
  paths: string[],
  message: string
): Promise<void> {
  validateEnv();
  if (paths.length === 0) return;

  // 1. Get the latest commit SHA on main
  const refRes = await fetch(`${API_BASE}/git/ref/heads/main`, {
    headers: headers(),
  });
  if (!refRes.ok) throw new Error(`Failed to get ref: ${refRes.status}`);
  const refData = await refRes.json();
  const latestCommitSha = refData.object.sha;

  // 2. Get the tree SHA of the latest commit
  const commitRes = await fetch(
    `${API_BASE}/git/commits/${latestCommitSha}`,
    { headers: headers() }
  );
  if (!commitRes.ok)
    throw new Error(`Failed to get commit: ${commitRes.status}`);
  const commitData = await commitRes.json();
  const baseTreeSha = commitData.tree.sha;

  // 3. Create a new tree that removes the specified files
  const treeItems = paths.map((path) => ({
    path,
    mode: "100644" as const,
    type: "blob" as const,
    sha: null, // null SHA = delete the file
  }));

  const newTreeRes = await fetch(`${API_BASE}/git/trees`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      base_tree: baseTreeSha,
      tree: treeItems,
    }),
  });
  if (!newTreeRes.ok) {
    const err = await newTreeRes.json().catch(() => ({}));
    throw new Error(
      `Failed to create tree: ${newTreeRes.status} ${err.message || ""}`
    );
  }
  const newTreeData = await newTreeRes.json();

  // 4. Create a new commit
  const newCommitRes = await fetch(`${API_BASE}/git/commits`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      message,
      tree: newTreeData.sha,
      parents: [latestCommitSha],
    }),
  });
  if (!newCommitRes.ok) {
    const err = await newCommitRes.json().catch(() => ({}));
    throw new Error(
      `Failed to create commit: ${newCommitRes.status} ${err.message || ""}`
    );
  }
  const newCommitData = await newCommitRes.json();

  // 5. Update the ref to point to the new commit
  const updateRefRes = await fetch(`${API_BASE}/git/refs/heads/main`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify({ sha: newCommitData.sha }),
  });
  if (!updateRefRes.ok) {
    const err = await updateRefRes.json().catch(() => ({}));
    throw new Error(
      `Failed to update ref: ${updateRefRes.status} ${err.message || ""}`
    );
  }
}
