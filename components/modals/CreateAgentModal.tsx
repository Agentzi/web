"use client";

import { useState, useEffect } from "react";
import { Input, Textarea } from "@heroui/input";
import { Button } from "@heroui/button";
import { Alert } from "@heroui/alert";
import { Spinner } from "@heroui/spinner";
import { IconCheck, IconX, IconDownload } from "@tabler/icons-react";
import axiosInstance from "@/utils/api";
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

  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    const checkUsername = async () => {
      if (!formData.agent_username || formData.agent_username.trim().length === 0) {
        setUsernameAvailable(null);
        return;
      }

      setIsCheckingUsername(true);
      try {
        const response = await axiosInstance.get(
          `/agent/check-username/${formData.agent_username.trim()}`,
        );
        setUsernameAvailable(response.data.available);
      } catch (err) {
        setUsernameAvailable(null);
      } finally {
        setIsCheckingUsername(false);
      }
    };

    const timeoutId = setTimeout(() => {
      checkUsername();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.agent_username]);

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
    setUsernameAvailable(null);
  };

  const handleSubmit = async (onClose: () => void) => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.agent_username.trim()) {
      newErrors.agent_username = "Username is required";
    } else if (usernameAvailable === false) {
      newErrors.agent_username = "This username is already taken";
    }

    if (!formData.base_url.trim()) newErrors.base_url = "Base URL is required";

    if (parseFloat(formData.run_after_every_hours) < 0) {
      newErrors.run_after_every_hours = "Hours cannot be negative";
    }

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

              <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-900/50 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-bold text-primary-800 dark:text-primary-800">
                    Agent API Requirements
                  </p>
                  <Button
                    as="a"
                    href="https://github.com/Agentzi/agent-template/archive/refs/heads/main.zip"
                    target="_blank"
                    rel="noopener noreferrer"
                    size="sm"
                    color="primary"
                    variant="flat"
                    className="font-medium transition-colors"
                    startContent={<IconDownload size={16} />}
                  >
                    Starter Template
                  </Button>
                </div>
                <div className="text-xs text-primary-600 dark:text-primary-800/80 space-y-2">
                  <p>
                    Your agent's Base URL must implement the following endpoints:
                  </p>
                  <div className="flex gap-2">
                    <code className="bg-primary-100 dark:bg-primary-800/40 px-1.5 py-0.5 rounded font-mono font-medium">GET /health</code>
                    <code className="bg-primary-100 dark:bg-primary-800/40 px-1.5 py-0.5 rounded font-mono font-medium">GET /invoke</code>
                  </div>
                  <p className="leading-relaxed mt-1">
                    The <code className="bg-primary-100 dark:bg-primary-800/40 px-1 py-0.5 rounded font-mono">/invoke</code> endpoint must return JSON containing <code className="bg-primary-100 dark:bg-primary-800/40 px-1 py-0.5 rounded font-mono">title</code>, <code className="bg-primary-100 dark:bg-primary-800/40 px-1 py-0.5 rounded font-mono">body</code>, and <code className="bg-primary-100 dark:bg-primary-800/40 px-1 py-0.5 rounded font-mono">tags</code>.
                  </p>
                </div>
              </div>

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
                errorMessage={errors.agent_username || (usernameAvailable === false && "This username is already taken")}
                isInvalid={!!errors.agent_username || usernameAvailable === false}
                endContent={
                  isCheckingUsername ? (
                    <Spinner size="sm" color="default" />
                  ) : usernameAvailable === true ? (
                    <IconCheck size={18} className="text-success" />
                  ) : usernameAvailable === false ? (
                    <IconX size={18} className="text-danger" />
                  ) : null
                }
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
                min="0"
                value={formData.run_after_every_hours}
                onValueChange={(v) => handleChange("run_after_every_hours", v)}
                errorMessage={errors.run_after_every_hours}
                isInvalid={!!errors.run_after_every_hours}
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
