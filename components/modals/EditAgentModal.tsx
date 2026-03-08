"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Avatar } from "@heroui/avatar";
import { Spinner } from "@heroui/spinner";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { IconUpload } from "@tabler/icons-react";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { updateAgent, uploadAgentImage, deleteAgent } from "@/store/slices/agentSlice";
import { useRouter } from "next/navigation";
import { Agent } from "@/types/agent";

interface EditAgentModalProps {
  agent: Agent | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditAgentModal({
  agent,
  isOpen,
  onOpenChange,
}: EditAgentModalProps) {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.agent);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    desc: "",
    base_url: "",
    run_after_every_hours: "24",
    version: "",
  });

  const [agentProfileUrl, setAgentProfileUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (agent) {
      setFormData({
        name: agent.name,
        desc: agent.desc || "",
        base_url: agent.base_url,
        run_after_every_hours: agent.run_after_every_hours.toString(),
        version: agent.version,
      });
      setAgentProfileUrl(agent.profile_url || null);
    }
  }, [agent]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !agent) return;

    setIsUploadingImage(true);
    try {
      const result = await dispatch(
        uploadAgentImage({ agentId: agent.id, file }),
      ).unwrap();
      setAgentProfileUrl(result.profile_url);
    } catch (error) {
      console.error("Failed to upload agent image", error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSave = async (onClose: () => void) => {
    if (!agent) return;

    const result = await dispatch(
      updateAgent({
        id: agent.id,
        name: formData.name,
        desc: formData.desc,
        base_url: formData.base_url,
        run_after_every_hours: parseFloat(formData.run_after_every_hours) || 24,
        version: formData.version,
      }),
    );

    if (updateAgent.fulfilled.match(result)) {
      onClose();
    }
  };

  const handleDelete = async (onClose: () => void) => {
    if (!agent) return;

    if (!window.confirm("Are you sure you want to delete this agent? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    const result = await dispatch(deleteAgent(agent.id));
    setIsDeleting(false);

    if (deleteAgent.fulfilled.match(result)) {
      onClose();
      router.push("/agents");
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top-center">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Edit Agent
              <p className="text-sm font-normal text-default-500">
                Update configuration for @{agent?.agent_username}
              </p>
            </ModalHeader>
            <ModalBody>
              <div className="flex justify-center mb-2">
                <div
                  className="relative group cursor-pointer"
                  onClick={() =>
                    !isUploadingImage && imageInputRef.current?.click()
                  }
                >
                  <Avatar
                    src={
                      agentProfileUrl ||
                      `https://api.dicebear.com/9.x/bottts/svg?seed=${agent?.agent_username}`
                    }
                    name={agent?.name?.[0]?.toUpperCase() || "A"}
                    size="lg"
                    classNames={{ base: "w-20 h-20 text-2xl bg-default-200" }}
                  />
                  <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {isUploadingImage ? (
                      <Spinner size="sm" color="white" />
                    ) : (
                      <IconUpload size={20} className="text-white" />
                    )}
                  </div>
                  <input
                    type="file"
                    ref={imageInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>
              </div>

              <Input
                label="Name"
                placeholder="Agent Name"
                variant="flat"
                value={formData.name}
                onValueChange={(v) =>
                  setFormData((prev) => ({ ...prev, name: v }))
                }
              />
              <Input
                label="Description"
                placeholder="Short description"
                variant="flat"
                value={formData.desc}
                onValueChange={(v) =>
                  setFormData((prev) => ({ ...prev, desc: v }))
                }
              />
              <Input
                label="Base URL"
                placeholder="https://..."
                variant="flat"
                value={formData.base_url}
                onValueChange={(v) =>
                  setFormData((prev) => ({ ...prev, base_url: v }))
                }
              />
              <div className="flex gap-4">
                <Input
                  label="Run Every (Hours)"
                  type="number"
                  variant="flat"
                  value={formData.run_after_every_hours}
                  onValueChange={(v) =>
                    setFormData((prev) => ({
                      ...prev,
                      run_after_every_hours: v,
                    }))
                  }
                />
                <Input
                  label="Version"
                  placeholder="1.0.0"
                  variant="flat"
                  value={formData.version}
                  onValueChange={(v) =>
                    setFormData((prev) => ({ ...prev, version: v }))
                  }
                />
              </div>
            </ModalBody>
            <ModalFooter className="flex justify-between items-center w-full">
              <Button
                color="danger"
                variant="light"
                isLoading={isDeleting}
                onPress={() => handleDelete(onClose)}
              >
                Delete Agent
              </Button>
              <div className="flex gap-2">
                <Button variant="flat" onPress={onClose} isDisabled={isDeleting}>
                  Cancel
                </Button>
                <Button
                  color="success"
                  variant="flat"
                  isLoading={isLoading && !isDeleting}
                  isDisabled={isDeleting}
                  onPress={() => handleSave(onClose)}
                >
                  Save Changes
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
