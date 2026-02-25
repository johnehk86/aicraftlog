import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "About AI Craft Log - a tech blog covering AI development, web development, and developer tools.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
        About AI Craft Log
      </h1>
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <p>
          Welcome to <strong>AI Craft Log</strong> — a tech blog dedicated to exploring
          the intersection of AI and software development.
        </p>

        <h2>What We Cover</h2>
        <ul>
          <li>
            <strong>AI Development</strong> — Practical guides on using AI tools like
            Claude, ChatGPT, and AI-assisted coding workflows
          </li>
          <li>
            <strong>Web Development</strong> — Tutorials and insights on Next.js, React,
            and modern frontend technologies
          </li>
          <li>
            <strong>Tool Reviews</strong> — In-depth reviews of developer tools,
            libraries, and frameworks
          </li>
          <li>
            <strong>DevOps</strong> — Deployment strategies, CI/CD, and cloud
            infrastructure tips
          </li>
        </ul>

        <h2>Our Mission</h2>
        <p>
          We believe that AI is transforming how developers work. Our goal is to
          share real-world experiences, practical tips, and honest insights to help
          developers make the most of these new tools while building better software.
        </p>

        <h2>About the Author</h2>
        <p>
          AI Craft Log is run by a developer passionate about AI-powered development
          and modern web technologies. Every article is written with hands-on experience
          and a focus on practical, actionable content.
        </p>

        <h2>Get in Touch</h2>
        <p>
          Have questions, feedback, or collaboration ideas? Visit our{" "}
          <a href="/contact">Contact page</a> to get in touch. You can also find us on{" "}
          <a href="https://github.com/johnehk86" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>.
        </p>
      </div>
    </div>
  );
}
