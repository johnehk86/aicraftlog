import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "AI Craft Log terms of service - rules and guidelines for using our site.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
        Terms of Service
      </h1>
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <p className="text-sm text-neutral-500">Last updated: 2026-02-25</p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing and using AI Craft Log (&quot;aicraftlog.com&quot;, hereinafter
          referred to as &quot;the Site&quot;), you agree to be bound by these Terms of
          Service. If you do not agree with any part of these terms, please do not
          use the Site.
        </p>

        <h2>2. Content</h2>
        <p>
          All content published on this Site, including articles, code snippets,
          images, and other materials, is provided for informational and educational
          purposes only. While we strive for accuracy, we make no warranties about
          the completeness or reliability of any content.
        </p>

        <h2>3. Intellectual Property</h2>
        <p>
          Unless otherwise stated, all original content on this Site is the property
          of AI Craft Log and is protected by copyright laws. You may share links
          to our articles, but reproducing full articles without permission is
          prohibited.
        </p>
        <p>
          Code snippets provided in tutorials are generally free to use in your own
          projects unless otherwise noted.
        </p>

        <h2>4. User Conduct</h2>
        <p>When using the Site, you agree not to:</p>
        <ul>
          <li>Post spam or inappropriate content in comments</li>
          <li>Attempt to gain unauthorized access to the Site</li>
          <li>Use automated tools to scrape content without permission</li>
          <li>Engage in any activity that disrupts the Site&apos;s operation</li>
        </ul>

        <h2>5. Third-Party Links</h2>
        <p>
          This Site may contain links to third-party websites. We are not responsible
          for the content or privacy practices of those sites. Visiting external links
          is at your own risk.
        </p>

        <h2>6. Advertisements</h2>
        <p>
          This Site displays advertisements through Google AdSense. These ads may
          use cookies to serve content based on your browsing history. For more
          information, please refer to our <a href="/privacy">Privacy Policy</a>.
        </p>

        <h2>7. Disclaimer</h2>
        <p>
          The information on this Site is provided &quot;as is&quot; without any
          warranties. We are not liable for any damages arising from the use of
          information provided on this Site. Always test code and follow best
          practices before deploying to production.
        </p>

        <h2>8. Changes to Terms</h2>
        <p>
          We reserve the right to modify these Terms of Service at any time.
          Changes will be effective immediately upon posting to this page.
          Continued use of the Site after changes constitutes acceptance of
          the new terms.
        </p>

        <h2>9. Contact</h2>
        <p>
          For questions about these Terms of Service, please visit our{" "}
          <a href="/contact">Contact page</a>.
        </p>
      </div>
    </div>
  );
}
