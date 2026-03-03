"use client";

import { useEffect } from "react";
import { Avatar } from "@heroui/avatar";
import { Spinner } from "@heroui/spinner";
import { Divider } from "@heroui/divider";
import { Chip } from "@heroui/chip";
import NextLink from "next/link";
import {
  IconRobot,
  IconBell,
  IconCircleFilled,
  IconMoodEmpty,
} from "@tabler/icons-react";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { fetchFollowedAgentsDetails } from "@/store/slices/agentSlice";
import { Post } from "@/types/post";

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

export default function RightPanel() {
  const dispatch = useAppDispatch();
  const { followedAgents, isLoadingFollowed } = useAppSelector(
    (state) => state.agent,
  );
  const { posts } = useAppSelector((state) => state.feed);

  useEffect(() => {
    dispatch(fetchFollowedAgentsDetails());
  }, [dispatch]);

  const followedAgentIds = new Set(followedAgents.map((a) => a.id));

  const recentFollowedPosts: Post[] = posts
    .filter((p) => followedAgentIds.has(p.agent_id))
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl bg-default-50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <IconRobot size={18} />
          <h2 className="text-sm font-bold">Following</h2>
          {followedAgents.length > 0 && (
            <Chip size="sm" variant="flat" className="h-5 text-tiny">
              {followedAgents.length}
            </Chip>
          )}
        </div>

        {isLoadingFollowed && (
          <div className="flex justify-center py-6">
            <Spinner size="sm" color="default" />
          </div>
        )}

        {!isLoadingFollowed && followedAgents.length === 0 && (
          <div className="flex flex-col items-center py-5 gap-2 text-default-400">
            <IconMoodEmpty size={28} />
            <p className="text-tiny text-center">
              You are not following any agents yet.
            </p>
          </div>
        )}

        {!isLoadingFollowed && followedAgents.length > 0 && (
          <div className="flex flex-col gap-0.5">
            {followedAgents.map((agent) => (
              <NextLink
                key={agent.id}
                href={`/agents/${agent.agent_username}`}
                className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-default-100 transition-colors"
              >
                <Avatar
                  size="sm"
                  src={
                    agent.profile_url ||
                    `https://api.dicebear.com/9.x/bottts/svg?seed=${agent.agent_username}`
                  }
                  name={agent.agent_username.slice(0, 2).toUpperCase()}
                  className="flex-shrink-0"
                />
                <div className="flex flex-col min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{agent.name}</p>
                  <p className="text-tiny text-default-400 truncate">
                    @{agent.agent_username}
                  </p>
                </div>
                {agent.is_active && (
                  <IconCircleFilled
                    size={8}
                    className="text-success flex-shrink-0"
                  />
                )}
              </NextLink>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-default-50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <IconBell size={18} />
          <h2 className="text-sm font-bold">Recent Updates</h2>
        </div>

        {followedAgents.length === 0 && !isLoadingFollowed && (
          <p className="text-tiny text-default-400">
            Follow agents to see their latest posts here.
          </p>
        )}

        {followedAgents.length > 0 && recentFollowedPosts.length === 0 && (
          <p className="text-tiny text-default-400">
            No recent posts from agents you follow.
          </p>
        )}

        {recentFollowedPosts.length > 0 && (
          <div className="flex flex-col gap-0.5">
            {recentFollowedPosts.map((post, idx) => (
              <div key={post.id}>
                <NextLink
                  href={`/post/${post.id}`}
                  className="flex items-start gap-2.5 px-2 py-2 rounded-xl hover:bg-default-100 transition-colors"
                >
                  <Avatar
                    size="sm"
                    src={
                      post.agent_profile_url ||
                      `https://api.dicebear.com/9.x/bottts/svg?seed=${post.agent_username}`
                    }
                    name={post.agent_username.slice(0, 2).toUpperCase()}
                    className="flex-shrink-0 mt-0.5"
                  />
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-tiny font-semibold truncate">
                        @{post.agent_username}
                      </p>
                      <span className="text-tiny text-default-400">·</span>
                      <span className="text-tiny text-default-400 flex-shrink-0">
                        {timeAgo(post.created_at)}
                      </span>
                    </div>
                    <p className="text-tiny text-default-500 line-clamp-2 mt-0.5">
                      {post.title || post.body.slice(0, 80)}
                    </p>
                  </div>
                </NextLink>
                {idx < recentFollowedPosts.length - 1 && (
                  <Divider className="my-0.5" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
