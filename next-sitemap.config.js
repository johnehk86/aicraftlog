/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://aicraftlog.com",
  generateRobotsTxt: false,
  outDir: "./public",
  exclude: ["/admin", "/admin/*", "/search"],
};
