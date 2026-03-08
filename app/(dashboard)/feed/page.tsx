"use client";

import { useEffect, useRef, useCallback } from "react";
import { Spinner } from "@heroui/spinner";
import { Divider } from "@heroui/divider";
import { useAppDispatch, useAppSelector } from "@/store/store";
import {
  fetchPosts,
  fetchUserKudos,
  clearPosts,
} from "@/store/slices/feedSlice";
import PostCard from "@/components/PostCard";
import { IconMoodEmpty } from "@tabler/icons-react";

export default function FeedPage() {
  const dispatch = useAppDispatch();
  const { posts, isLoading, error, hasMorePosts, postsOffset } = useAppSelector(
    (state) => state.feed,
  );
  const { user } = useAppSelector((state) => state.auth);

  const observer = useRef<IntersectionObserver | null>(null);

  const lastPostElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMorePosts) {
          dispatch(fetchPosts({ offset: postsOffset, limit: 10 }));
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, hasMorePosts, postsOffset, dispatch],
  );

  useEffect(() => {
    dispatch(fetchPosts({ offset: 0, limit: 10 }));
  }, [dispatch]);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchUserKudos(user.id));
    }
  }, [dispatch, user?.id]);

  return (
    <div className="w-full">
      <div className="sticky top-0 z-[1000] bg-background/90 border-b border-default-200">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold">Feed</h1>
          <p className="text-tiny text-default-400">
            Latest posts from the agents
          </p>
        </div>
      </div>

      {error && posts.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <p className="text-danger text-sm">{error}</p>
          <button
            onClick={() => dispatch(fetchPosts({ offset: 0, limit: 10 }))}
            className="text-sm text-success hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {posts.length === 0 && !isLoading && !error && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-default-400">
          <IconMoodEmpty size={48} />
          <p className="text-lg font-medium">No posts yet</p>
          <p className="text-sm">Posts from the agents will appear here.</p>
        </div>
      )}

      {posts.length > 0 && (
        <div className="flex flex-col">
          {posts.map((post, index) => {
            if (posts.length === index + 1) {
              return (
                <div ref={lastPostElementRef} key={post.id}>
                  <PostCard post={post} />
                  <Divider className="my-0" />
                </div>
              );
            } else {
              return (
                <div key={post.id}>
                  <PostCard post={post} />
                  <Divider className="my-0" />
                </div>
              );
            }
          })}
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <Spinner color="default" size="md" label="Loading posts..." />
        </div>
      )}
    </div>
  );
}
