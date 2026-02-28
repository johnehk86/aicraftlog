"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import TurndownService from "turndown";


const Editor = dynamic(() => import("@/components/admin/Editor"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] rounded-lg border border-neutral-300 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800/50" />
  ),
});

const turndown = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
});
turndown.escape = (str: string) => str;

interface CategoryItem {
  label: string;
  value: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function WritePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [category, setCategory] = useState("ai");
  const [tags, setTags] = useState("");
  const [featured, setFeatured] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [publishDate, setPublishDate] = useState("");
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const htmlRef = useRef("");

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => {});
  }, []);

  const handleEditorChange = useCallback((html: string) => {
    htmlRef.current = html;
  }, []);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugManual) {
      setSlug(slugify(value));
    }
  }

  async function handleSave(asDraft: boolean, scheduleDate?: string) {
    if (!title || !slug) {
      setError("Title and slug are required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const markdown = turndown.turndown(htmlRef.current || "");

      const frontmatter: Record<string, unknown> = {
        title,
        description,
        date,
        category,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        featured: featured || undefined,
        draft: asDraft || undefined,
      };
      if (scheduleDate) {
        frontmatter.publishDate = scheduleDate;
        frontmatter.draft = undefined;
      }

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          frontmatter,
          content: markdown,
        }),
      });

      if (res.ok) {
        router.push("/admin");
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

  function handleSchedule() {
    if (!publishDate) {
      setError("Please select a schedule date and time.");
      return;
    }
    handleSave(false, publishDate);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          New Post
        </h1>
        <Link
          href="/admin"
          className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
        >
          Back to Dashboard
        </Link>
      </div>

      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-neutral-900 focus:border-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Slug
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => {
              setSlugManual(true);
              setSlug(e.target.value);
            }}
            className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 font-mono text-sm text-neutral-900 focus:border-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </div>

        {/* Description */}
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-neutral-900 focus:border-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </div>

        {/* Date + Category row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-neutral-900 focus:border-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-neutral-900 focus:border-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="ai, tutorial, guide"
            className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-neutral-900 focus:border-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </div>

        {/* Checkboxes */}
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="rounded"
            />
            Featured
          </label>
        </div>

        {/* Content - Rich Text Editor */}
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Content
          </label>
          <Editor content="" onChange={handleEditorChange} />
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <div className="flex flex-wrap items-end gap-3">
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="rounded-lg border border-neutral-300 px-6 py-2 font-medium text-neutral-700 hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            {saving ? "Saving..." : "Save as Draft"}
          </button>
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => setShowSchedule(!showSchedule)}
              disabled={saving}
              className="rounded-lg border border-blue-300 px-6 py-2 font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-50 dark:border-blue-600 dark:text-blue-400 dark:hover:bg-blue-900/20"
            >
              Schedule
            </button>
            {showSchedule && (
              <div className="flex items-end gap-2">
                <input
                  type="datetime-local"
                  value={publishDate}
                  onChange={(e) => setPublishDate(e.target.value)}
                  className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
                <button
                  onClick={handleSchedule}
                  disabled={saving || !publishDate}
                  className="whitespace-nowrap rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Scheduling..." : "Confirm Schedule"}
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Publishing..." : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}
