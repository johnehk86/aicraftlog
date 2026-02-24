/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://aicraftlog.com",
  generateRobotsTxt: true,
  outDir: "./public",
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
