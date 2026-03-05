"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Avatar } from "@heroui/avatar";
import { Spinner } from "@heroui/spinner";
import { Button } from "@heroui/button";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import {
  IconArrowLeft,
  IconCircleCheck,
  IconCircleX,
  IconCalendar,
  IconRobot,
  IconMoodEmpty,
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandX,
  IconWorld,
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

      <div className="relative h-32 bg-gradient-to-r from-default-200 to-default-100 group">
        {viewedUser?.banner_url && (
          <img
            src={viewedUser.banner_url}
            alt="Banner"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <div className="px-4 -mt-12 flex justify-between items-end relative z-10">
        <div className="relative group">
          <Avatar
            className="ring-4 ring-background"
            color="default"
            src={
              viewedUser?.profile_url ||
              `https://api.dicebear.com/9.x/avataaars/svg?seed=${viewedUser?.username}`
            }
            name={`${viewedUser?.first_name?.[0] || ""}${viewedUser?.last_name?.[0] || ""}`}
            size="lg"
            classNames={{ base: "w-20 h-20 text-2xl bg-default-200" }}
          />
        </div>
      </div>

      <div className="px-4 mt-3">
        <h2 className="text-xl font-bold">
          {viewedUser?.first_name} {viewedUser?.last_name}
        </h2>
        <p className="text-sm text-default-400">@{viewedUser?.username}</p>

        {viewedUser?.bio && (
          <p className="text-sm text-default-600 mt-2 leading-relaxed">
            {viewedUser.bio}
          </p>
        )}

        <div className="flex flex-wrap gap-4 mt-3 text-sm text-default-400">
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

        {(viewedUser?.github_url ||
          viewedUser?.linkedin_url ||
          viewedUser?.x_url ||
          viewedUser?.website_url) && (
          <div className="flex flex-wrap gap-3 mt-4">
            {viewedUser?.github_url && (
              <a
                href={viewedUser?.github_url}
                target="_blank"
                rel="noreferrer"
                className="text-default-500 hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <IconBrandGithub size={20} />
              </a>
            )}
            {viewedUser?.linkedin_url && (
              <a
                href={viewedUser?.linkedin_url}
                target="_blank"
                rel="noreferrer"
                className="text-default-500 hover:text-foreground transition-colors"
                aria-label="LinkedIn"
              >
                <IconBrandLinkedin size={20} />
              </a>
            )}
            {viewedUser?.x_url && (
              <a
                href={viewedUser?.x_url}
                target="_blank"
                rel="noreferrer"
                className="text-default-500 hover:text-foreground transition-colors"
                aria-label="X (Twitter)"
              >
                <IconBrandX size={20} />
              </a>
            )}
            {viewedUser?.website_url && (
              <a
                href={viewedUser?.website_url}
                target="_blank"
                rel="noreferrer"
                className="text-default-500 hover:text-foreground transition-colors"
                aria-label="Personal Website"
              >
                <IconWorld size={20} />
              </a>
            )}
          </div>
        )}
      </div>

      <Divider className="mt-4" />

      <div className="">
        <div className="px-4 py-6">
          <h3 className="text-lg font-bold mb-4">Agents</h3>

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {agents.map((agent) => (
                <Card
                  shadow="sm"
                  key={agent.id}
                  isPressable
                  onPress={() => router.push(`/agents/${agent.agent_username}`)}
                  className="w-full hover:scale-[1.02] transition-transform duration-200"
                >
                  <CardHeader className="flex gap-3 px-4 pt-4 pb-0">
                    <Avatar
                      size="sm"
                      color={agent.is_active ? "success" : "default"}
                      src={`https://api.dicebear.com/9.x/bottts/svg?seed=${agent.agent_username}`}
                      name={agent.agent_username.slice(0, 2).toUpperCase()}
                    />
                    <div className="flex flex-col flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold truncate leading-tight">
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
                      <p className="text-tiny text-default-400 truncate leading-tight mt-0.5">
                        @{agent.agent_username}
                      </p>
                    </div>
                  </CardHeader>
                  <CardBody className="px-4 py-3">
                    <p className="text-sm text-default-500 line-clamp-2 min-h-[40px] text-left">
                      {agent.desc || "No description provided."}
                    </p>
                  </CardBody>
                  <CardFooter className="px-4 pb-4 pt-0 flex justify-between items-center">
                    <Chip
                      size="sm"
                      variant="flat"
                      color={agent.is_active ? "success" : "default"}
                    >
                      {agent.is_active ? "Active" : "Inactive"}
                    </Chip>
                    <span className="text-tiny text-default-400">
                      v{agent.version}
                    </span>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
