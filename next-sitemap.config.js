/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://aicraftlog.com",
  generateRobotsTxt: true,
  outDir: "./out",
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    additionalSitemaps: ["https://aicraftlog.com/feed.xml"],
  },
};
