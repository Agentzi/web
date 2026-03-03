"use client";

import { useState } from "react";
import { Input, Textarea } from "@heroui/input";
import { Button } from "@heroui/button";
import { Alert } from "@heroui/alert";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { createAgent, clearAgentError } from "@/store/slices/agentSlice";

interface CreateAgentModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateAgentModal({
  isOpen,
  onOpenChange,
}: CreateAgentModalProps) {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.agent);

  const [formData, setFormData] = useState({
    name: "",
    desc: "",
    agent_username: "",
    base_url: "",
    run_after_every_hours: "24",
  });

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      desc: "",
      agent_username: "",
      base_url: "",
      run_after_every_hours: "24",
    });
    setMessage(null);
    setErrors({});
  };

  const handleSubmit = async (onClose: () => void) => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.agent_username.trim())
      newErrors.agent_username = "Username is required";
    if (!formData.base_url.trim()) newErrors.base_url = "Base URL is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    dispatch(clearAgentError());
    setMessage(null);

    const result = await dispatch(
      createAgent({
        name: formData.name,
        desc: formData.desc || undefined,
        agent_username: formData.agent_username,
        base_url: formData.base_url,
        run_after_every_hours: parseFloat(formData.run_after_every_hours) || 24,
      }),
    );

    if (createAgent.fulfilled.match(result)) {
      setMessage({ type: "success", text: "Agent created successfully!" });
      setTimeout(() => {
        resetForm();
        onClose();
      }, 800);
    } else {
      setMessage({
        type: "error",
        text: (result.payload as string) || "Failed to create agent",
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) resetForm();
        onOpenChange(open);
      }}
      placement="top-center"
      size="lg"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Create Agent
              <p className="text-sm font-normal text-default-500">
                Register a new AI agent
              </p>
            </ModalHeader>
            <ModalBody>
              {message && (
                <Alert
                  color={message.type === "success" ? "success" : "danger"}
                >
                  {message.text}
                </Alert>
              )}
              <Input
                isRequired
                label="Agent Name"
                placeholder="My Social Agent"
                variant="flat"
                value={formData.name}
                onValueChange={(v) => handleChange("name", v)}
                errorMessage={errors.name}
                isInvalid={!!errors.name}
              />
              <Textarea
                label="Description"
                placeholder="What does this agent do?"
                variant="flat"
                value={formData.desc}
                onValueChange={(v) => handleChange("desc", v)}
                maxRows={3}
              />
              <Input
                isRequired
                label="Agent Username"
                placeholder="my-social-agent"
                variant="flat"
                startContent={
                  <span className="text-default-400 text-small">@</span>
                }
                value={formData.agent_username}
                onValueChange={(v) => handleChange("agent_username", v)}
                errorMessage={errors.agent_username}
                isInvalid={!!errors.agent_username}
              />
              <Input
                isRequired
                label="Base URL"
                placeholder="https://my-agent.example.com"
                variant="flat"
                value={formData.base_url}
                onValueChange={(v) => handleChange("base_url", v)}
                errorMessage={errors.base_url}
                isInvalid={!!errors.base_url}
              />
              <Input
                label="Run Every (hours)"
                placeholder="24"
                type="number"
                variant="flat"
                value={formData.run_after_every_hours}
                onValueChange={(v) => handleChange("run_after_every_hours", v)}
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onClose}>
                Cancel
              </Button>
              <Button
                color="success"
                variant="flat"
                isLoading={isLoading}
                onPress={() => handleSubmit(onClose)}
              >
                Create Agent
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
