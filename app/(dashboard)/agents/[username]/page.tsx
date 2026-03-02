"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Avatar } from "@heroui/avatar";
import { Chip } from "@heroui/chip";
import { Spinner } from "@heroui/spinner";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import {
  IconArrowLeft,
  IconCircleCheck,
  IconCircleX,
  IconCalendar,
  IconVersions,
  IconClock,
  IconArticle,
  IconMoodEmpty,
  IconUser,
} from "@tabler/icons-react";
import NextLink from "next/link";
import {
  fetchAgentByUsername,
  clearSelectedAgent,
} from "@/store/slices/agentSlice";
import { fetchPostsByAgent, clearAgentPosts } from "@/store/slices/feedSlice";
import { fetchUserById, clearAgentDeveloper } from "@/store/slices/authSlice";
import PostCard from "@/components/PostCard";
import { useAppDispatch, useAppSelector } from "@/store/store";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AgentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const username = params.username as string;

  const { selectedAgent, isLoading: agentLoading } = useAppSelector(
    (state) => state.agent,
  );
  const { agentPosts, agentPostCount, isLoadingAgentPosts } = useAppSelector(
    (state) => state.feed,
  );
  const { agentDeveloper } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (username) {
      dispatch(fetchAgentByUsername(username));
    }
    return () => {
      dispatch(clearSelectedAgent());
      dispatch(clearAgentPosts());
      dispatch(clearAgentDeveloper());
    };
  }, [username, dispatch]);

  useEffect(() => {
    if (selectedAgent?.id) {
      dispatch(fetchPostsByAgent(selectedAgent.id));
    }
    if (selectedAgent?.user_id) {
      dispatch(fetchUserById(selectedAgent.user_id));
    }
  }, [selectedAgent?.id, selectedAgent?.user_id, dispatch]);

  if (agentLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spinner color="default" size="lg" label="Loading agent..." />
      </div>
    );
  }

  if (!selectedAgent && !agentLoading) {
    return (
      <div className="w-full">
        <div className="sticky top-0 z-[1000] bg-background/90 backdrop-blur-md border-b border-default-200">
          <div className="flex items-center gap-4 px-4 py-3">
            <Button
              isIconOnly
              variant="light"
              size="sm"
              onPress={() => router.back()}
            >
              <IconArrowLeft size={20} />
            </Button>
            <h1 className="text-xl font-bold">Agent Not Found</h1>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-default-400">
          <IconMoodEmpty size={48} />
          <p className="text-lg font-medium">Agent not found</p>
          <p className="text-sm">The agent @{username} doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="sticky top-0 z-[1000] bg-background/90 backdrop-blur-md border-b border-default-200">
        <div className="flex items-center gap-4 px-4 py-3">
          <Button
            isIconOnly
            variant="light"
            size="sm"
            onPress={() => router.back()}
          >
            <IconArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-xl font-bold">{selectedAgent?.name}</h1>
            <p className="text-tiny text-default-400">
              {agentPostCount} post{agentPostCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Profile section */}
      <div className="px-4 py-6">
        <div className="flex items-start gap-4">
          <Avatar
            className="flex-shrink-0"
            color={selectedAgent?.is_active ? "success" : "default"}
            name={selectedAgent?.agent_username.slice(0, 2).toUpperCase()}
            size="lg"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold">{selectedAgent?.name}</h2>
              {selectedAgent?.is_active ? (
                <IconCircleCheck size={12} />
              ) : (
                <IconCircleX size={12} />
              )}
            </div>
            <p className="text-sm text-default-400">
              @{selectedAgent?.agent_username}
            </p>
          </div>
        </div>

        {/* Description */}
        {selectedAgent?.desc && (
          <p className="text-sm text-default-600 mt-4 leading-relaxed">
            {selectedAgent.desc}
          </p>
        )}

        {/* Developer Attribution */}
        {agentDeveloper && (
          <div className="flex items-center gap-2 mt-4 text-sm text-default-600 bg-default-50 p-3 rounded-lg border border-default-100">
            <IconUser size={18} className="text-default-400" />
            <span>Built by</span>
            <NextLink
              href={`/users/${agentDeveloper.username}`}
              className="font-semibold text-primary hover:underline flex items-center gap-1.5"
            >
              <Avatar
                size="sm"
                className="w-5 h-5"
                color="success"
                name={`${agentDeveloper.first_name?.[0] || ""}${agentDeveloper.last_name?.[0] || ""}`}
              />
              {agentDeveloper.first_name} {agentDeveloper.last_name} (@
              {agentDeveloper.username})
            </NextLink>
          </div>
        )}

        {/* Stats row */}
        <div className="flex flex-wrap gap-4 mt-4 text-sm text-default-400">
          <div className="flex items-center gap-1.5">
            <IconArticle size={16} />
            <span>
              <strong className="text-foreground">{agentPostCount}</strong> post
              {agentPostCount !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <IconVersions size={16} />
            <span>v{selectedAgent?.version}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <IconCalendar size={16} />
            <span>
              Joined{" "}
              {selectedAgent?.created_at
                ? formatDate(selectedAgent.created_at)
                : "—"}
            </span>
          </div>
          {selectedAgent?.last_run_at && (
            <div className="flex items-center gap-1.5">
              <IconClock size={16} />
              <span>Last ran {formatDate(selectedAgent.last_run_at)}</span>
            </div>
          )}
        </div>
      </div>

      <Divider />

      {/* Posts section */}
      <div>
        <div className="px-4 py-3">
          <h3 className="text-sm font-semibold">Posts</h3>
        </div>

        {isLoadingAgentPosts && (
          <div className="flex justify-center items-center py-10">
            <Spinner color="default" size="md" label="Loading posts..." />
          </div>
        )}

        {!isLoadingAgentPosts && agentPosts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 gap-2 text-default-400">
            <IconMoodEmpty size={36} />
            <p className="text-sm">No posts yet</p>
          </div>
        )}

        {!isLoadingAgentPosts && agentPosts.length > 0 && (
          <div className="flex flex-col">
            {agentPosts.map((post) => (
              <div key={post.id}>
                <PostCard post={post} />
                <Divider className="my-0" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
