import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "AI Craft Log privacy policy - how we collect, use, and protect your information.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
        Privacy Policy
      </h1>
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <p className="text-sm text-neutral-500">Last updated: 2026-02-25</p>

        <h2>1. Overview</h2>
        <p>
          AI Craft Log(&quot;aicraftlog.com&quot;, hereinafter referred to as &quot;the Site&quot;)
          values the privacy of its visitors. This Privacy Policy explains what information
          we collect, how we use it, and your rights regarding your data.
        </p>

        <h2>2. Information We Collect</h2>
        <h3>Automatically Collected Information</h3>
        <ul>
          <li>IP address, browser type, operating system</li>
          <li>Pages visited, time spent, referring URL</li>
          <li>Device information (screen size, language settings)</li>
        </ul>
        <h3>Cookies</h3>
        <p>
          We use cookies and similar technologies to improve your browsing experience,
          analyze site traffic, and serve relevant advertisements. You can control cookie
          settings through your browser preferences.
        </p>

        <h2>3. Third-Party Services</h2>
        <h3>Google Analytics</h3>
        <p>
          We use Google Analytics to understand how visitors interact with our site.
          Google Analytics collects information such as how often users visit the site,
          what pages they visit, and what other sites they used before visiting.
          For more information, see{" "}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
            Google&apos;s Privacy Policy
          </a>.
        </p>
        <h3>Google AdSense</h3>
        <p>
          We use Google AdSense to display advertisements. Google AdSense may use cookies
          and web beacons to serve ads based on your prior visits to this site or other sites.
          You may opt out of personalized advertising by visiting{" "}
          <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">
            Google Ads Settings
          </a>.
        </p>
        <h3>Giscus (Comments)</h3>
        <p>
          Our comment system is powered by Giscus, which uses GitHub Discussions.
          When you leave a comment, you authenticate through your GitHub account.
          Please refer to{" "}
          <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener noreferrer">
            GitHub&apos;s Privacy Policy
          </a>{" "}
          for how your data is handled.
        </p>
        <h3>Cloudflare</h3>
        <p>
          This site is hosted on Cloudflare Pages. Cloudflare may collect certain
          technical data for security and performance purposes. See{" "}
          <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer">
            Cloudflare&apos;s Privacy Policy
          </a>.
        </p>

        <h2>4. How We Use Your Information</h2>
        <ul>
          <li>To operate and maintain the Site</li>
          <li>To analyze usage patterns and improve content</li>
          <li>To display relevant advertisements</li>
          <li>To prevent abuse and ensure site security</li>
        </ul>

        <h2>5. Data Sharing</h2>
        <p>
          We do not sell or rent your personal information to third parties.
          We may share data with the third-party service providers listed above
          solely for the purposes described in this policy.
        </p>

        <h2>6. Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access and request a copy of your data</li>
          <li>Request deletion of your data</li>
          <li>Opt out of personalized advertising</li>
          <li>Disable cookies through your browser settings</li>
        </ul>

        <h2>7. Children&apos;s Privacy</h2>
        <p>
          This Site is not directed to children under the age of 13. We do not
          knowingly collect personal information from children.
        </p>

        <h2>8. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Any changes will
          be posted on this page with an updated revision date.
        </p>

        <h2>9. Contact</h2>
        <p>
          If you have questions about this Privacy Policy, please contact us
          through our <a href="/contact">Contact page</a>.
        </p>
      </div>
    </div>
  );
}
