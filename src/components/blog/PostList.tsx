import { PostMeta } from "@/types/post";
import PostCard from "./PostCard";

interface PostListProps {
  posts: PostMeta[];
}

export default function PostList({ posts }: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="py-20 text-center">
        <span className="material-symbols-outlined mb-4 text-[48px] text-slate-300 dark:text-slate-600">
          article
        </span>
        <p className="text-slate-500 dark:text-slate-400">
          No posts yet.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {posts.map((post) => (
        <PostCard key={post.slug} post={post} />
      ))}
    </div>
  );
}
