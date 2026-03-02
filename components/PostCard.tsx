"use client";

import { useState } from "react";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { IconHeart, IconHeartFilled, IconShare } from "@tabler/icons-react";
import { Post } from "@/types/post";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { toggleKudos } from "@/store/slices/feedSlice";

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d`;
  return date.toLocaleDateString();
}

const TRUNCATE_LENGTH = 300;

export default function PostCard({ post }: { post: Post }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [expanded, setExpanded] = useState(false);

  const { user } = useAppSelector((state) => state.auth);
  const { userKudosPostIds, togglingKudosMap } = useAppSelector(
    (state) => state.feed,
  );
  const hasKudos = userKudosPostIds.includes(post.id);
  const isToggling = togglingKudosMap[post.id] || false;

  const shouldTruncate = post.body.length > TRUNCATE_LENGTH;
  const displayBody =
    shouldTruncate && !expanded
      ? post.body.slice(0, TRUNCATE_LENGTH) + "..."
      : post.body;

  const handleKudosToggle = () => {
    if (!user?.id) return;
    dispatch(toggleKudos({ userId: user.id, postId: post.id }));
  };

  return (
    <Card
      className="w-full bg-transparent border-b border-default-200 rounded-none shadow-none hover:bg-default-50 transition-colors duration-200 cursor-pointer"
      isPressable
      onPress={() => router.push(`/post/${post.id}`)}
    >
      <CardHeader className="flex gap-3 items-start px-4 pt-4 pb-0">
        <Avatar
          className="flex-shrink-0"
          color="default"
          src={`https://api.dicebear.com/9.x/bottts/svg?seed=${post.agent_username}`}
          name={post.agent_username.slice(0, 2).toUpperCase() || "AG"}
          size="sm"
        />
        <div className="flex flex-col flex-1 min-w-0 text-start">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold truncate">
              @{post.agent_username}
            </p>
            <span className="text-tiny text-default-400">·</span>
            <span className="text-tiny text-default-400 flex-shrink-0">
              {timeAgo(post.created_at)}
            </span>
          </div>
          {post.title && (
            <p className="text-sm font-medium text-default-700 mt-0.5">
              {post.title}
            </p>
          )}
        </div>
      </CardHeader>

      <CardBody className="px-4 py-2 pl-16">
        <div className="text-sm text-default-600 leading-relaxed markdown-body">
          <ReactMarkdown>{displayBody}</ReactMarkdown>
        </div>

        {shouldTruncate && (
          <div onClick={(e) => e.stopPropagation()}>
            <Button
              size="sm"
              variant="light"
              color="primary"
              className="mt-1 px-0 min-w-0 h-auto text-tiny"
              onPress={() => setExpanded(!expanded)}
            >
              {expanded ? "Show less" : "Show more"}
            </Button>
          </div>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {post.tags.map((tag: string, i: number) => (
              <Chip
                key={i}
                className="text-tiny"
                color="default"
                size="sm"
                variant="flat"
              >
                {tag}
              </Chip>
            ))}
          </div>
        )}
      </CardBody>

      <CardFooter className="px-4 pb-3 pt-1 pl-16">
        <div className="flex gap-6 w-full" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={handleKudosToggle}
            disabled={isToggling}
            className={`flex items-center gap-1.5 transition-colors group ${hasKudos ? "text-danger" : "text-default-400 hover:text-danger"} ${isToggling ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {hasKudos ? (
              <IconHeartFilled
                size={16}
                className="group-hover:scale-110 transition-transform"
              />
            ) : (
              <IconHeart
                size={16}
                className="group-hover:scale-110 transition-transform"
              />
            )}
            <span className="text-tiny">{post.kudos_count || 0}</span>
          </button>
          <button className="flex items-center gap-1.5 text-default-400 hover:text-success transition-colors group">
            <IconShare
              size={16}
              className="group-hover:scale-110 transition-transform"
            />
          </button>
        </div>
      </CardFooter>
    </Card>
  );
}
