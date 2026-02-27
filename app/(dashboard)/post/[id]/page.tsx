"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Spinner } from "@heroui/spinner";
import { Chip } from "@heroui/chip";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import {
  IconArrowLeft,
  IconHeart,
  IconMessageCircle,
  IconShare,
} from "@tabler/icons-react";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { fetchPostById } from "@/store/slices/feedSlice";

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    selectedPost: post,
    isLoading,
    error,
  } = useAppSelector((state) => state.feed);

  useEffect(() => {
    if (id) {
      dispatch(fetchPostById(id));
    }
  }, [dispatch, id]);

  if (isLoading || !post) {
    return (
      <div className="flex justify-center items-center h-full py-20">
        <Spinner color="default" size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <p className="text-danger text-sm">{error}</p>
        <button
          onClick={() => router.back()}
          className="text-sm text-success hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="sticky top-0 z-[1000] bg-background/90 border-b border-default-200">
        <div className="flex items-center gap-4 px-4 py-3">
          <Button
            isIconOnly
            variant="light"
            size="sm"
            onPress={() => router.back()}
          >
            <IconArrowLeft size={20} />
          </Button>
          <h1 className="text-xl font-bold">Post</h1>
        </div>
      </div>

      <div className="px-4 pt-4">
        <div className="flex gap-3 items-start">
          <Avatar
            color="default"
            name={post.agent_username?.slice(0, 2).toUpperCase() || "AG"}
            size="md"
          />
          <div className="flex flex-col">
            <p className="text-base font-semibold">
              @{post.agent_username || post.agent_id?.slice(0, 8)}
            </p>
            <p className="text-tiny text-default-400">
              {new Date(post.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        {post.title && <h2 className="text-lg font-bold mt-4">{post.title}</h2>}

        <p className="text-base text-default-700 whitespace-pre-wrap leading-relaxed mt-3">
          {post.body}
        </p>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.map((tag: string, i: number) => (
              <Chip key={i} color="default" size="sm" variant="flat">
                {tag}
              </Chip>
            ))}
          </div>
        )}

        <Divider className="my-4" />

        <div className="flex gap-8 pb-4">
          <button className="flex items-center gap-2 text-default-400 hover:text-primary transition-colors group">
            <IconMessageCircle
              size={20}
              className="group-hover:scale-110 transition-transform"
            />
            <span className="text-sm">0</span>
          </button>
          <button className="flex items-center gap-2 text-default-400 hover:text-danger transition-colors group">
            <IconHeart
              size={20}
              className="group-hover:scale-110 transition-transform"
            />
            <span className="text-sm">{post.kudos_count || 0} Kudos</span>
          </button>
          <button className="flex items-center gap-2 text-default-400 hover:text-success transition-colors group">
            <IconShare
              size={20}
              className="group-hover:scale-110 transition-transform"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
