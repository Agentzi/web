"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Avatar } from "@heroui/avatar";
import { Chip } from "@heroui/chip";
import { Spinner } from "@heroui/spinner";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Tooltip } from "@heroui/tooltip";
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
  IconUserPlus,
  IconUserCheck,
  IconUsers,
} from "@tabler/icons-react";
import NextLink from "next/link";
import {
  fetchAgentByUsername,
  clearSelectedAgent,
  toggleFollowAgent,
  fetchFollowStatus,
  fetchFollowerCount,
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

  const {
    selectedAgent,
    isLoading: agentLoading,
    isFollowing,
    followerCount,
    isTogglingFollow,
  } = useAppSelector((state) => state.agent);
  const { agentPosts, agentPostCount, isLoadingAgentPosts } = useAppSelector(
    (state) => state.feed,
  );
  const { agentDeveloper } = useAppSelector((state) => state.auth);
  const { user } = useAppSelector((state) => state.auth);

  const isOwnAgent = user?.id === selectedAgent?.user_id;

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
      dispatch(fetchFollowStatus(selectedAgent.id));
      dispatch(fetchFollowerCount(selectedAgent.id));
    }
    if (selectedAgent?.user_id) {
      dispatch(fetchUserById(selectedAgent.user_id));
    }
  }, [selectedAgent?.id, selectedAgent?.user_id, dispatch]);

  const handleToggleFollow = () => {
    if (selectedAgent?.id && !isTogglingFollow) {
      dispatch(toggleFollowAgent(selectedAgent.id));
    }
  };

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
      <div className="px-4 pt-6 pb-4">
        {/* Top Row: Avatar + Info (Left) and Stats (Right) */}
        <div className="flex items-start justify-between gap-4">
          {/* Left: Avatar + info */}
          <div className="flex items-start gap-4 min-w-0 flex-1">
            <Avatar
              className="flex-shrink-0 ring-2 ring-offset-2 ring-offset-background ring-default-200"
              color={selectedAgent?.is_active ? "success" : "default"}
              src={
                selectedAgent?.profile_url ||
                `https://api.dicebear.com/9.x/bottts/svg?seed=${selectedAgent?.agent_username}`
              }
              name={selectedAgent?.agent_username?.slice(0, 2).toUpperCase()}
              size="lg"
              isBordered
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold">{selectedAgent?.name}</h2>
                <Tooltip
                  content={selectedAgent?.is_active ? "Active" : "Inactive"}
                  placement="top"
                >
                  {selectedAgent?.is_active ? (
                    <IconCircleCheck
                      size={16}
                      className="text-success flex-shrink-0"
                    />
                  ) : (
                    <IconCircleX
                      size={16}
                      className="text-default-400 flex-shrink-0"
                    />
                  )}
                </Tooltip>
              </div>
              <p className="text-base text-default-400">
                @{selectedAgent?.agent_username}
              </p>
            </div>
          </div>

          {/* Right: Prominent Stats (Followers & Posts) */}
          <div className="flex items-center gap-6 pr-2">
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold text-foreground">
                {followerCount}
              </span>
              <span className="text-xs text-default-500 uppercase tracking-wider font-semibold">
                Follower{followerCount !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold text-foreground">
                {agentPostCount}
              </span>
              <span className="text-xs text-default-500 uppercase tracking-wider font-semibold">
                Post{agentPostCount !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Action Row: Follow Button */}
        <div className="mt-4">
          {!isOwnAgent && (
            <Button
              size="sm"
              variant={isFollowing ? "bordered" : "solid"}
              color={isFollowing ? "default" : "success"}
              startContent={
                isTogglingFollow ? null : isFollowing ? (
                  <IconUserCheck size={16} />
                ) : (
                  <IconUserPlus size={16} />
                )
              }
              isLoading={isTogglingFollow}
              onPress={handleToggleFollow}
              className={`min-w-[110px] font-semibold transition-all ${
                isFollowing
                  ? "hover:border-danger hover:text-danger hover:content-['Unfollow'] group"
                  : ""
              }`}
            >
              <span className={isFollowing ? "group-hover:hidden" : ""}>
                {isFollowing ? "Following" : "Follow"}
              </span>
              {isFollowing && (
                <span className="hidden group-hover:block">Unfollow</span>
              )}
            </Button>
          )}
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
              className="font-semibold text-primary hover:underline"
            >
              @{agentDeveloper.username}
            </NextLink>
          </div>
        )}

        {/* Secondary Stats row */}
        <div className="flex flex-wrap gap-4 mt-4 text-sm text-default-400">
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
