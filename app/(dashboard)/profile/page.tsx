"use client";

import { useEffect, useState } from "react";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Input } from "@heroui/input";
import { Spinner } from "@heroui/spinner";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import {
  IconCalendar,
  IconMail,
  IconAt,
  IconEdit,
  IconCheck,
  IconX,
  IconRobot,
  IconPlus,
} from "@tabler/icons-react";
import NextLink from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { getUser, updateUser } from "@/store/slices/authSlice";

interface EditData {
  first_name: string;
  last_name: string;
  username: string;
}

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector((state) => state.auth);
  const { agents } = useAppSelector((state) => state.agent);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<EditData>({
    first_name: "",
    last_name: "",
    username: "",
  });

  useEffect(() => {
    if (!user) {
      dispatch(getUser());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (user) {
      setEditData({
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
      });
    }
  }, [user]);

  const handleSave = async () => {
    const result = await dispatch(updateUser(editData));
    if (updateUser.fulfilled.match(result)) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setEditData({
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
      });
    }
    setIsEditing(false);
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
      <div className="sticky top-0 z-[1000] bg-background/90 border-b border-default-200">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold">Profile</h1>
        </div>
      </div>

      <div className="h-32 bg-gradient-to-r from-default-200 to-default-100" />

      <div className="px-4 -mt-12 flex justify-between items-end">
        <Avatar
          className="ring-4 ring-background"
          color="default"
          name={`${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`}
          size="lg"
          classNames={{ base: "w-20 h-20 text-2xl" }}
        />
        <div className="pb-2">
          {isEditing ? (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="flat"
                color="danger"
                startContent={<IconX size={16} />}
                onPress={handleCancel}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="flat"
                color="success"
                startContent={<IconCheck size={16} />}
                isLoading={isLoading}
                onPress={handleSave}
              >
                Save
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="bordered"
              className="rounded-full"
              startContent={<IconEdit size={16} />}
              onPress={() => setIsEditing(true)}
            >
              Edit profile
            </Button>
          )}
        </div>
      </div>

      <div className="px-4 mt-3">
        {isEditing ? (
          <div className="flex flex-col gap-3 max-w-sm">
            <Input
              label="First Name"
              labelPlacement="outside"
              size="sm"
              value={editData.first_name}
              onValueChange={(v: string) =>
                setEditData((prev: EditData) => ({ ...prev, first_name: v }))
              }
            />
            <Input
              label="Last Name"
              labelPlacement="outside"
              size="sm"
              value={editData.last_name}
              onValueChange={(v: string) =>
                setEditData((prev: EditData) => ({ ...prev, last_name: v }))
              }
            />
            <Input
              label="Username"
              labelPlacement="outside"
              size="sm"
              startContent={
                <span className="text-default-400 text-small">@</span>
              }
              value={editData.username}
              onValueChange={(v: string) =>
                setEditData((prev: EditData) => ({ ...prev, username: v }))
              }
            />
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold">
              {user.first_name} {user.last_name}
            </h2>
            <p className="text-default-400 text-sm">@{user.username}</p>
          </>
        )}

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
            as={NextLink}
            href="/agents/create"
            size="sm"
            variant="flat"
            color="success"
            startContent={<IconPlus size={16} />}
          >
            New Agent
          </Button>
        </div>

        {agents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-default-400 gap-2">
            <IconRobot size={40} />
            <p className="text-sm">No agents created yet.</p>
            <Button
              as={NextLink}
              href="/agents/create"
              size="sm"
              variant="flat"
              color="success"
            >
              Create your first agent
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {agents.map((agent) => (
              <Card
                key={agent.id}
                className="shadow-none border border-default-200"
              >
                <CardBody className="flex flex-row items-center gap-3 p-3">
                  <Avatar
                    size="sm"
                    color="default"
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
