"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface NavLink {
  label: string;
  href: string;
}

interface Category {
  label: string;
  value: string;
}

export default function NavLinksPage() {
  const [navLinks, setNavLinks] = useState<NavLink[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newHref, setNewHref] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    Promise.all([fetchNavLinks(), fetchCategories()]).finally(() =>
      setLoading(false)
    );
  }, []);

  async function fetchNavLinks() {
    try {
      const res = await fetch("/api/nav-links");
      if (res.ok) {
        setNavLinks(await res.json());
      }
    } catch {}
  }

  async function fetchCategories() {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        setCategories(await res.json());
      }
    } catch {}
  }

  async function handleAdd() {
    if (!newLabel || !newHref) {
      setError("Label and href are required.");
      return;
    }

    const updated = [...navLinks, { label: newLabel, href: newHref }];
    await saveNavLinks(updated);
    setNewLabel("");
    setNewHref("");
  }

  function handleCategorySelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    if (!value) return;

    const cat = categories.find((c) => c.value === value);
    if (cat) {
      setNewLabel(cat.label);
      setNewHref(`/category/${cat.value}`);
    }
    e.target.value = "";
  }

  async function handleDelete(index: number) {
    const link = navLinks[index];
    if (!confirm(`Delete "${link.label}"?`)) return;
    const updated = navLinks.filter((_, i) => i !== index);
    await saveNavLinks(updated);
  }

  async function handleMoveUp(index: number) {
    if (index === 0) return;
    const updated = [...navLinks];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    await saveNavLinks(updated);
  }

  async function handleMoveDown(index: number) {
    if (index === navLinks.length - 1) return;
    const updated = [...navLinks];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    await saveNavLinks(updated);
  }

  async function saveNavLinks(updated: NavLink[]) {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/nav-links", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });

      if (res.ok) {
        setNavLinks(updated);
        setSuccess("Saved!");
        setTimeout(() => setSuccess(""), 2000);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save");
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Manage Nav Links
        </h1>
        <Link
          href="/admin"
          className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
        >
          Back to Dashboard
        </Link>
      </div>

      {loading ? (
        <p className="text-neutral-500">Loading...</p>
      ) : (
        <div className="space-y-6">
          {/* Nav Links List */}
          <div className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800/50">
                  <th className="px-4 py-3 font-medium text-neutral-500 dark:text-neutral-400">
                    Label
                  </th>
                  <th className="px-4 py-3 font-medium text-neutral-500 dark:text-neutral-400">
                    Href
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-neutral-500 dark:text-neutral-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {navLinks.map((link, i) => (
                  <tr
                    key={`${link.href}-${i}`}
                    className="border-b border-neutral-100 last:border-0 dark:border-neutral-800/50"
                  >
                    <td className="px-4 py-3 font-medium text-neutral-900 dark:text-neutral-100">
                      {link.label}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-neutral-500 dark:text-neutral-400">
                      {link.href}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleMoveUp(i)}
                          disabled={i === 0 || saving}
                          className="text-neutral-400 hover:text-neutral-600 disabled:opacity-30 dark:hover:text-neutral-300"
                          title="Move up"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => handleMoveDown(i)}
                          disabled={i === navLinks.length - 1 || saving}
                          className="text-neutral-400 hover:text-neutral-600 disabled:opacity-30 dark:hover:text-neutral-300"
                          title="Move down"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => handleDelete(i)}
                          disabled={saving}
                          className="text-red-600 hover:text-red-800 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {navLinks.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-6 text-center text-neutral-500"
                    >
                      No nav links yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Add New Nav Link */}
          <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
            <h2 className="mb-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              Add New Nav Link
            </h2>

            {/* Category quick select */}
            {categories.length > 0 && (
              <div className="mb-3">
                <select
                  onChange={handleCategorySelect}
                  defaultValue=""
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                >
                  <option value="">Quick add from categories...</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label} (/category/{cat.value})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="Label (e.g. AI Dev)"
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={newHref}
                  onChange={(e) => setNewHref(e.target.value)}
                  placeholder="Href (e.g. /category/ai)"
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 font-mono text-sm text-neutral-900 focus:border-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>
              <button
                onClick={handleAdd}
                disabled={saving}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          {success && (
            <p className="text-sm text-green-600 dark:text-green-400">
              {success}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
