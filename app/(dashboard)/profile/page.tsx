"use client";

import { useEffect, useState, useRef } from "react";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Spinner } from "@heroui/spinner";
import { Card, CardBody } from "@heroui/card";
import {
  IconCalendar,
  IconMail,
  IconEdit,
  IconRobot,
  IconPlus,
  IconUpload,
} from "@tabler/icons-react";
import { useDisclosure } from "@heroui/modal";
import { useAppDispatch, useAppSelector } from "@/store/store";
import {
  getUser,
  uploadProfileImage,
  uploadBannerImage,
} from "@/store/slices/authSlice";
import {
  fetchAgentByDevId,
  toggleAgentState,
  toggleAgentStateLocal,
} from "@/store/slices/agentSlice";
import { Switch } from "@heroui/switch";
import { Agent } from "@/types/agent";
import EditAgentModal from "@/components/modals/EditAgentModal";
import CreateAgentModal from "@/components/modals/CreateAgentModal";
import EditProfileModal from "@/components/modals/EditProfileModal";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector((state) => state.auth);
  const { agents } = useAppSelector((state) => state.agent);
  const router = useRouter();

  const editProfileModal = useDisclosure();
  const createAgentModal = useDisclosure();
  const editAgentModal = useDisclosure();
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  const profileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  const handleToggleAgentState = (agentId: string) => {
    dispatch(toggleAgentState(agentId));
    dispatch(toggleAgentStateLocal(agentId));
  };

  const openEditAgentModal = (agent: Agent) => {
    setEditingAgent(agent);
    editAgentModal.onOpen();
  };

  useEffect(() => {
    if (!user) {
      dispatch(getUser());
    }
    if (user) {
      dispatch(fetchAgentByDevId(user?.id as string));
    }
  }, [dispatch, user]);

  const handleProfileImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingProfile(true);
      try {
        await dispatch(uploadProfileImage(file)).unwrap();
      } catch (error) {
        console.error("Failed to upload profile image", error);
      } finally {
        setIsUploadingProfile(false);
      }
    }
  };

  const handleBannerImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingBanner(true);
      try {
        await dispatch(uploadBannerImage(file)).unwrap();
      } catch (error) {
        console.error("Failed to upload banner image", error);
      } finally {
        setIsUploadingBanner(false);
      }
    }
  };

  if (isLoading && !user) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner color="default" size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-full text-default-400">
        <p>Could not load profile.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="sticky top-0 z-[1] bg-background/90 border-b border-default-200">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold">Profile</h1>
        </div>
      </div>

      <div className="relative h-32 bg-gradient-to-r from-default-200 to-default-100 group">
        {user.banner_url && (
          <img
            src={user.banner_url}
            alt="Banner"
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button
            size="sm"
            variant="flat"
            color="default"
            startContent={
              isUploadingBanner ? (
                <Spinner size="sm" color="default" />
              ) : (
                <IconUpload size={16} />
              )
            }
            onPress={() => bannerInputRef.current?.click()}
            isDisabled={isUploadingBanner}
          >
            {isUploadingBanner ? "Uploading..." : "Change Banner"}
          </Button>
          <input
            type="file"
            ref={bannerInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleBannerImageChange}
          />
        </div>
      </div>

      <div className="px-4 -mt-12 flex justify-between items-end relative z-10">
        <div
          className="relative group cursor-pointer"
          onClick={() =>
            !isUploadingProfile && profileInputRef.current?.click()
          }
        >
          <Avatar
            className="ring-4 ring-background"
            color="default"
            src={
              user.profile_url ||
              `https://api.dicebear.com/9.x/avataaars/svg?seed=${user.username}`
            }
            name={`${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`}
            size="lg"
            classNames={{ base: "w-20 h-20 text-2xl bg-default-200" }}
          />
          <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center ring-4 ring-transparent">
            {isUploadingProfile ? (
              <Spinner size="sm" color="white" />
            ) : (
              <IconUpload size={20} className="text-white" />
            )}
          </div>
          <input
            type="file"
            ref={profileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleProfileImageChange}
          />
        </div>
        <div className="pb-2">
          <Button
            size="sm"
            variant="bordered"
            startContent={<IconEdit size={16} />}
            onPress={editProfileModal.onOpen}
          >
            Edit profile
          </Button>
        </div>
      </div>

      <div className="px-4 mt-3">
        <h2 className="text-xl font-bold">
          {user.first_name} {user.last_name}
        </h2>
        <p className="text-default-400 text-sm">@{user.username}</p>
        <p className="text-default-400 text-sm pt-2">{user.bio}</p>

        <div className="flex flex-wrap gap-4 mt-3 text-sm text-default-400">
          <div className="flex items-center gap-1">
            <IconMail size={16} />
            <span>{user.email}</span>
          </div>
          <div className="flex items-center gap-1">
            <IconCalendar size={16} />
            <span>
              Joined{" "}
              {new Date(user.created_at).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      <Divider className="mt-4" />

      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <IconRobot size={20} />
            <h3 className="text-lg font-bold">Your Agents</h3>
          </div>
          <Button
            size="sm"
            variant="flat"
            color="success"
            startContent={<IconPlus size={16} />}
            onPress={createAgentModal.onOpen}
          >
            New Agent
          </Button>
        </div>

        {agents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-default-400 gap-2">
            <IconRobot size={40} />
            <p className="text-sm">No agents created yet.</p>
            <Button
              size="sm"
              variant="flat"
              color="success"
              onPress={createAgentModal.onOpen}
            >
              Create your first agent
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {agents.map((agent) => (
              <Card
                key={agent.id}
                isPressable
                onPress={() =>
                  router.push(`/agents/dev/${agent.agent_username}`)
                }
                className="shadow-none ult-200 cursor-pointer"
              >
                <CardBody className="flex flex-row items-center gap-3 p-3">
                  <Avatar
                    size="sm"
                    color="default"
                    src={`https://api.dicebear.com/9.x/bottts/svg?seed=${agent.agent_username}`}
                    name={agent.name?.slice(0, 2).toUpperCase()}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {agent.name}
                    </p>
                    <p className="text-tiny text-default-400 truncate">
                      @{agent.agent_username}
                    </p>
                  </div>
                  <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      isIconOnly
                      size="sm"
                      variant="flat"
                      color="default"
                      startContent={<IconEdit size={16} />}
                      onPress={() => openEditAgentModal(agent)}
                    ></Button>
                    <Switch
                      size="sm"
                      color={agent.is_active ? "success" : "default"}
                      isSelected={agent.is_active}
                      onValueChange={() => handleToggleAgentState(agent.id)}
                    ></Switch>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>

      <EditProfileModal
        isOpen={editProfileModal.isOpen}
        onOpenChange={editProfileModal.onOpenChange}
        user={user}
      />
      <CreateAgentModal
        isOpen={createAgentModal.isOpen}
        onOpenChange={createAgentModal.onOpenChange}
      />
      <EditAgentModal
        agent={editingAgent}
        isOpen={editAgentModal.isOpen}
        onOpenChange={editAgentModal.onOpenChange}
      />
    </div>
  );
}
