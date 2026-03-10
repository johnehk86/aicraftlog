# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev          # Start dev server (next dev)
npm run build        # Build + postbuild (sitemap, search index, RSS)
npm run lint         # ESLint with next/core-web-vitals
npm run start        # Start production server locally
```

The `build` script chains: `next build` → `next-sitemap` → `scripts/generate-search-index.mjs` → `scripts/generate-rss.mjs`.

No test framework is configured.

## Architecture Overview

**Next.js 15 App Router** blog with admin dashboard, deployed on **Cloudflare Pages** (`@cloudflare/next-on-pages`). All data is file-based — no database.

### Content Pipeline (Hybrid SSG + Edge API)

1. **Write:** Admin dashboard (`/admin/write`) uses TipTap editor → converts HTML to Markdown via Turndown
2. **Store:** POST to `/api/posts` → GitHub Contents API stores `.mdx` files in `content/posts/YYYY/`
3. **Build:** `npm run build` reads local `content/posts/` via Node.js `fs` → generates static pages via `generateStaticParams()`
4. **Serve:** Static HTML on Cloudflare CDN; API routes run on Cloudflare Workers (Edge Runtime)

### Key Modules

| Module | Purpose |
|--------|---------|
| `src/lib/posts.ts` | Local filesystem post reader (Node.js, build-time SSG) |
| `src/lib/github.ts` | GitHub Contents API wrapper (Edge Runtime, CRUD) |
| `src/lib/r2.ts` | Cloudflare R2 image upload via `aws4fetch` |
| `src/lib/mdx.ts` | MDX compilation with remark/rehype plugins |
| `src/lib/auth.ts` | HMAC-SHA256 token auth (Web Crypto API, 24h expiry) |
| `src/lib/frontmatter-edge.ts` | Edge-compatible YAML frontmatter parser |
| `src/lib/constants.ts` | Site config, category groups |

### Route Groups

- `src/app/(blog)/` — Public blog pages (home, posts, categories, tags, search, info pages)
- `src/app/admin/` — Dashboard (login, editor, categories, nav-links management)
- `src/app/api/` — Edge API routes (posts CRUD, image upload, auth, analytics)

### Content Files

- `content/posts/` — MDX blog posts organized by year
- `content/categories.json` — Dynamic category list
- `content/nav-links.json` — Navigation menu config
- `content/projects.json` — Featured projects for homepage

## Important Conventions

- **Edge Runtime:** API routes use Web APIs only (`aws4fetch` instead of AWS SDK, Web Crypto instead of Node crypto). No Node.js-specific modules in API routes.
- **Path alias:** `@/*` maps to `src/*` (tsconfig)
- **Images:** `unoptimized: true` in next.config (Cloudflare Pages doesn't support Next.js image optimization). Remote patterns allow `*.r2.dev` and `images.unsplash.com`.
- **Styling:** Tailwind CSS 4.0 with `@tailwindcss/typography` for prose. Dark mode via `next-themes` (default: light).
- **MDX plugins:** remark-gfm, rehype-slug, rehype-autolink-headings, rehype-pretty-code (Shiki, github-dark theme)
- **ESLint:** `@next/next/no-img-element` rule is disabled

## Post Frontmatter Schema

```yaml
title: string           # Required
description: string     # Required
date: "YYYY-MM-DD"      # Required
category: string        # From categories.json
tags: [string]           # Array
thumbnail: string       # Optional image URL
featured: boolean       # Show on homepage
draft: boolean          # Hide from listings
```

## Environment Variables

GitHub (editorial API): `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO`
Cloudflare R2 (images): `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`
Auth: `AUTH_SECRET`
Optional: `NEXT_PUBLIC_GISCUS_REPO`, `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_ADSENSE_ID`
