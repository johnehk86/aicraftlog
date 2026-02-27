"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface PostItem {
  slug: string;
  title: string;
  date: string;
  category: string;
  draft: boolean;
}

export default function AdminDashboard() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      const res = await fetch("/api/posts");
      if (res.ok) {
        setPosts(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }

  async function handlePublish(slug: string) {
    const res = await fetch(`/api/posts/${slug}`);
    if (!res.ok) return;
    const data = await res.json();

    const { draft: _draft, ...frontmatter } = data.frontmatter;
    await fetch(`/api/posts/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ frontmatter, content: data.content }),
    });

    setPosts((prev) =>
      prev.map((p) => (p.slug === slug ? { ...p, draft: false } : p))
    );
  }

  async function handleDelete(slug: string) {
    if (!confirm(`Delete "${slug}"?`)) return;

    const res = await fetch(`/api/posts/${slug}`, { method: "DELETE" });
    if (res.ok) {
      setPosts((prev) => prev.filter((p) => p.slug !== slug));
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(slug);
        return next;
      });
    }
  }

  async function handleBatchDelete() {
    const count = selected.size;
    if (count === 0) return;
    if (!confirm(`Delete ${count} selected post${count > 1 ? "s" : ""}?`))
      return;

    setDeleting(true);
    try {
      const res = await fetch("/api/posts/batch-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slugs: Array.from(selected) }),
      });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => !selected.has(p.slug)));
        setSelected(new Set());
      }
    } finally {
      setDeleting(false);
    }
  }

  function toggleSelect(slug: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === posts.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(posts.map((p) => p.slug)));
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Dashboard
        </h1>
        <div className="flex gap-3">
          <Link
            href="/admin/categories"
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            Categories
          </Link>
          <Link
            href="/admin/nav-links"
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            Nav Links
          </Link>
          <Link
            href="/admin/write"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            New Post
          </Link>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            Logout
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-neutral-500">Loading...</p>
      ) : posts.length === 0 ? (
        <p className="text-neutral-500">No posts yet.</p>
      ) : (
        <>
          {selected.size > 0 && (
            <div className="mb-4 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 dark:border-red-800 dark:bg-red-900/20">
              <span className="text-sm text-red-700 dark:text-red-400">
                {selected.size} selected
              </span>
              <button
                onClick={handleBatchDelete}
                disabled={deleting}
                className="ml-auto rounded-lg bg-red-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete selected"}
              </button>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800">
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={
                        posts.length > 0 && selected.size === posts.length
                      }
                      onChange={toggleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="px-4 py-3 font-medium text-neutral-500 dark:text-neutral-400">
                    Title
                  </th>
                  <th className="px-4 py-3 font-medium text-neutral-500 dark:text-neutral-400">
                    Date
                  </th>
                  <th className="px-4 py-3 font-medium text-neutral-500 dark:text-neutral-400">
                    Category
                  </th>
                  <th className="px-4 py-3 font-medium text-neutral-500 dark:text-neutral-400">
                    Status
                  </th>
                  <th className="px-4 py-3 font-medium text-neutral-500 dark:text-neutral-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr
                    key={post.slug}
                    className={`border-b border-neutral-100 dark:border-neutral-800/50 ${
                      selected.has(post.slug)
                        ? "bg-blue-50 dark:bg-blue-900/10"
                        : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(post.slug)}
                        onChange={() => toggleSelect(post.slug)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-neutral-900 dark:text-neutral-100">
                      {post.title}
                    </td>
                    <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">
                      {post.date}
                    </td>
                    <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">
                      {post.category}
                    </td>
                    <td className="px-4 py-3">
                      {post.draft ? (
                        <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                          Draft
                        </span>
                      ) : (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          Published
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {post.draft && (
                          <button
                            onClick={() => handlePublish(post.slug)}
                            className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                          >
                            Publish
                          </button>
                        )}
                        <Link
                          href={`/admin/write/${post.slug}`}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(post.slug)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
