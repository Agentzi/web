"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Avatar } from "@heroui/avatar";
import { Spinner } from "@heroui/spinner";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import {
  IconArrowLeft,
  IconCalendar,
  IconRobot,
  IconMoodEmpty,
  IconCircleCheck,
  IconCircleX,
} from "@tabler/icons-react";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { fetchUserByUsername, clearViewedUser } from "@/store/slices/authSlice";
import { fetchAgentByDevId } from "@/store/slices/agentSlice";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const username = params.username as string;

  const { viewedUser, isLoading } = useAppSelector((state) => state.auth);
  const { agents, isLoading: agentsLoading } = useAppSelector(
    (state) => state.agent,
  );

  useEffect(() => {
    if (username) {
      dispatch(fetchUserByUsername(username));
    }
    return () => {
      dispatch(clearViewedUser());
    };
  }, [username, dispatch]);

  useEffect(() => {
    if (viewedUser?.id) {
      dispatch(fetchAgentByDevId(viewedUser.id));
    }
  }, [viewedUser?.id, dispatch]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spinner color="default" size="lg" />
      </div>
    );
  }

  if (!viewedUser && !isLoading) {
    return (
      <div className="w-full">
        <div className="sticky top-0 z-[100] bg-background/90 backdrop-blur-md border-b border-default-200">
          <div className="flex items-center gap-4 px-4 py-3">
            <Button
              isIconOnly
              variant="light"
              size="sm"
              onPress={() => router.back()}
            >
              <IconArrowLeft size={20} />
            </Button>
            <h1 className="text-xl font-bold">User Not Found</h1>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-default-400">
          <IconMoodEmpty size={48} />
          <p className="text-lg font-medium">User not found</p>
          <p className="text-sm">@{username} doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="sticky top-0 z-[100] bg-background/90 backdrop-blur-md border-b border-default-200">
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
            <h1 className="text-xl font-bold">
              {viewedUser?.first_name} {viewedUser?.last_name}
            </h1>
            <p className="text-tiny text-default-400">
              {agents.length} agent{agents.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Profile section */}
      <div className="px-4 py-6">
        <div className="flex items-start gap-4">
          <Avatar
            className="flex-shrink-0"
            color="success"
            name={`${viewedUser?.first_name?.[0] || ""}${viewedUser?.last_name?.[0] || ""}`}
            size="lg"
          />
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold">
              {viewedUser?.first_name} {viewedUser?.last_name}
            </h2>
            <p className="text-sm text-default-400">@{viewedUser?.username}</p>
          </div>
        </div>

        {viewedUser?.bio && (
          <p className="text-sm text-default-600 mt-4 leading-relaxed">
            {viewedUser.bio}
          </p>
        )}

        <div className="flex flex-wrap gap-4 mt-4 text-sm text-default-400">
          <div className="flex items-center gap-1.5">
            <IconCalendar size={16} />
            <span>
              Joined{" "}
              {viewedUser?.created_at ? formatDate(viewedUser.created_at) : "—"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <IconRobot size={16} />
            <span>
              <strong className="text-foreground">{agents.length}</strong> agent
              {agents.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      <Divider />

      {/* Agents section */}
      <div>
        <div className="px-4 py-3">
          <h3 className="text-sm font-semibold">Agents</h3>
        </div>

        {agentsLoading && (
          <div className="flex justify-center items-center py-10">
            <Spinner color="default" size="md" />
          </div>
        )}

        {!agentsLoading && agents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 gap-2 text-default-400">
            <IconMoodEmpty size={36} />
            <p className="text-sm">No agents yet</p>
          </div>
        )}

        {!agentsLoading && agents.length > 0 && (
          <div className="flex flex-col">
            {agents.map((agent) => (
              <Card
                key={agent.id}
                isPressable
                onPress={() => router.push(`/agents/${agent.agent_username}`)}
                className="bg-transparent rounded-none shadow-none border-b border-default-200 hover:bg-default-50 transition-colors"
              >
                <CardBody className="flex flex-row items-center gap-3 px-4 py-3">
                  <Avatar
                    size="sm"
                    color={agent.is_active ? "success" : "default"}
                    name={agent.agent_username.slice(0, 2).toUpperCase()}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold truncate">
                        {agent.name}
                      </p>
                      {agent.is_active ? (
                        <IconCircleCheck
                          size={14}
                          className="text-success flex-shrink-0"
                        />
                      ) : (
                        <IconCircleX
                          size={14}
                          className="text-default-400 flex-shrink-0"
                        />
                      )}
                    </div>
                    <p className="text-tiny text-default-400 truncate">
                      @{agent.agent_username}
                    </p>
                    {agent.desc && (
                      <p className="text-tiny text-default-500 truncate mt-0.5">
                        {agent.desc}
                      </p>
                    )}
                  </div>
                  <Chip
                    size="sm"
                    variant="flat"
                    color={agent.is_active ? "success" : "default"}
                  >
                    {agent.is_active ? "Active" : "Inactive"}
                  </Chip>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
