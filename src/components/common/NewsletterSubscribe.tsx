"use client";

import { useState, FormEvent } from "react";

export default function NewsletterSubscribe() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage("Thanks for subscribing! Check your email to confirm.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        Stay Updated
      </h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Get notified when I publish new posts. No spam, unsubscribe anytime.
      </p>

      {status === "success" ? (
        <p className="mt-4 text-sm font-medium text-green-600 dark:text-green-400">
          {message}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === "error") setStatus("idle");
            }}
            placeholder="your@email.com"
            required
            className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-primary/20 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-primary-400 dark:focus:ring-primary-400"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600 disabled:opacity-50 dark:bg-primary dark:hover:bg-primary-400"
          >
            {status === "loading" ? "..." : "Subscribe"}
          </button>
        </form>
      )}

      {status === "error" && message && (
        <p className="mt-2 text-sm text-red-500 dark:text-red-400">
          {message}
        </p>
      )}
    </div>
  );
}
