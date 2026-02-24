export interface Frontmatter {
  title: string;
  description: string;
  date: string;
  updated?: string;
  category: string;
  tags: string[];
  thumbnail?: string;
  featured?: boolean;
  draft?: boolean;
}

export interface Post {
  slug: string;
  frontmatter: Frontmatter;
  content: string;
  readingTime: string;
}

export interface PostMeta {
  slug: string;
  frontmatter: Frontmatter;
  readingTime: string;
}

export interface CategoryGroup {
  name: string;
  slug: string;
  children?: CategoryItem[];
}

export interface CategoryItem {
  name: string;
  slug: string;
}
