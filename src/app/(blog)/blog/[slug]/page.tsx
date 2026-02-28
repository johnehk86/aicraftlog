import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getAllPosts, getPostBySlug, getRelatedPosts } from "@/lib/posts";
import { compileMDXContent, extractHeadings } from "@/lib/mdx";
import { SITE_CONFIG } from "@/lib/constants";
import PostHeader from "@/components/blog/PostHeader";
import TableOfContents from "@/components/blog/TableOfContents";
import RelatedPosts from "@/components/blog/RelatedPosts";
import SocialShare from "@/components/common/SocialShare";
import GiscusComments from "@/components/comments/GiscusComments";
import AdSlot from "@/components/ads/AdSlot";
import NewsletterSubscribe from "@/components/common/NewsletterSubscribe";

export const dynamicParams = false;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const { frontmatter } = post;
  const url = `${SITE_CONFIG.url}/blog/${slug}`;

  return {
    title: frontmatter.title,
    description: frontmatter.description,
    openGraph: {
      title: frontmatter.title,
      description: frontmatter.description,
      url,
      type: "article",
      publishedTime: frontmatter.date,
      modifiedTime: frontmatter.updated,
      tags: frontmatter.tags,
      images: frontmatter.thumbnail
        ? [{ url: frontmatter.thumbnail }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: frontmatter.title,
      description: frontmatter.description,
      images: frontmatter.thumbnail ? [frontmatter.thumbnail] : undefined,
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const { content } = await compileMDXContent(post.content);
  const headings = extractHeadings(post.content);
  const relatedPosts = getRelatedPosts(slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.frontmatter.title,
    description: post.frontmatter.description,
    datePublished: post.frontmatter.date,
    dateModified: post.frontmatter.updated || post.frontmatter.date,
    author: {
      "@type": "Person",
      name: SITE_CONFIG.author,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_CONFIG.title,
    },
    url: `${SITE_CONFIG.url}/blog/${slug}`,
    image: post.frontmatter.thumbnail,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex gap-8">
          {/* Main content */}
          <article className="min-w-0 flex-1">
            <PostHeader
              frontmatter={post.frontmatter}
              readingTime={post.readingTime}
            />

            <AdSlot slot="header-ad" format="horizontal" />

            <div className="prose prose-lg max-w-none dark:prose-invert">
              {content}
            </div>

            <div className="mt-8">
              <SocialShare title={post.frontmatter.title} slug={slug} />
            </div>

            <AdSlot slot="footer-ad" format="horizontal" />

            <RelatedPosts posts={relatedPosts} />
            <div className="my-8">
              <NewsletterSubscribe />
            </div>
            <GiscusComments slug={slug} title={post.frontmatter.title} />
          </article>

          {/* Desktop sidebar */}
          <div className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-20 space-y-6">
              <TableOfContents headings={headings} />
              <AdSlot slot="sidebar-ad" format="vertical" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
