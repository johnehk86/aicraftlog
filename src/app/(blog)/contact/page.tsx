import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact AI Craft Log - get in touch with questions, feedback, or collaboration ideas.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
        Contact
      </h1>
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <p>
          Thank you for your interest in AI Craft Log. We welcome your questions,
          feedback, and collaboration ideas.
        </p>

        <h2>How to Reach Us</h2>

        <div className="not-prose my-6 space-y-4">
          <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
            <h3 className="mb-1 font-semibold text-neutral-900 dark:text-neutral-100">
              Email
            </h3>
            <a
              href="mailto:johnehk86@gmail.com"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              johnehk86@gmail.com
            </a>
          </div>

          <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
            <h3 className="mb-1 font-semibold text-neutral-900 dark:text-neutral-100">
              GitHub
            </h3>
            <a
              href="https://github.com/johnehk86"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              github.com/johnehk86
            </a>
          </div>

          <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
            <h3 className="mb-1 font-semibold text-neutral-900 dark:text-neutral-100">
              Blog Comments
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              You can also leave comments on any blog post using your GitHub account
              through our Giscus comment system.
            </p>
          </div>
        </div>

        <h2>Response Time</h2>
        <p>
          We typically respond within 1-2 business days. For urgent matters,
          email is the fastest way to reach us.
        </p>
      </div>
    </div>
  );
}
