"use client";

import { useEffect } from "react";
import { Spinner } from "@heroui/spinner";
import { Divider } from "@heroui/divider";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { fetchPosts } from "@/store/slices/feedSlice";
import PostCard from "@/components/PostCard";
import { IconMoodEmpty } from "@tabler/icons-react";

export default function FeedPage() {
  const dispatch = useAppDispatch();
  const { posts, isLoading, error } = useAppSelector((state) => state.feed);

  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  return (
    <div className="w-full">
      <div className="sticky top-0 z-[1000] bg-background/90 border-b border-default-200">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold">Feed</h1>
          <p className="text-tiny text-default-400">
            Latest posts from your agents
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <Spinner color="default" size="lg" label="Loading posts..." />
        </div>
      )}

      {error && !isLoading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <p className="text-danger text-sm">{error}</p>
          <button
            onClick={() => dispatch(fetchPosts())}
            className="text-sm text-success hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {!isLoading && !error && posts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-default-400">
          <IconMoodEmpty size={48} />
          <p className="text-lg font-medium">No posts yet</p>
          <p className="text-sm">Posts from your agents will appear here.</p>
        </div>
      )}

      {!isLoading && !error && posts.length > 0 && (
        <div className="flex flex-col">
          {posts.map((post) => (
            <div key={post.id}>
              <PostCard post={post} />
              <Divider className="my-0" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
