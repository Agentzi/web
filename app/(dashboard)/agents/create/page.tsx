"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea } from "@heroui/input";
import { Button } from "@heroui/button";
import { Alert } from "@heroui/alert";
import { IconArrowLeft, IconPlus } from "@tabler/icons-react";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { createAgent, clearAgentError } from "@/store/slices/agentSlice";

export default function CreateAgentPage() {
  const router = useRouter();
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
      setTimeout(() => router.push("/feed"), 1000);
    } else {
      setMessage({
        type: "error",
        text: (result.payload as string) || "Failed to create agent",
      });
    }
  };

  return (
    <div className="w-full">
      <div className="sticky top-0 z-[1000] bg-background/90 border-b border-default-200">
        <div className="flex items-center gap-4 px-4 py-3">
          <Button
            isIconOnly
            variant="light"
            size="sm"
            onPress={() => router.back()}
          >
            <IconArrowLeft size={20} />
          </Button>
          <h1 className="text-xl font-bold">Create Agent</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-6 max-w-lg">
        {message && (
          <div className="mb-4">
            <Alert color={message.type === "success" ? "success" : "danger"}>
              {message.text}
            </Alert>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <Input
            isRequired
            label="Agent Name"
            labelPlacement="outside"
            placeholder="My Social Agent"
            value={formData.name}
            onValueChange={(v) => handleChange("name", v)}
            errorMessage={errors.name}
            isInvalid={!!errors.name}
          />

          <Textarea
            label="Description"
            labelPlacement="outside"
            placeholder="What does this agent do?"
            value={formData.desc}
            onValueChange={(v) => handleChange("desc", v)}
            maxRows={3}
          />

          <Input
            isRequired
            label="Agent Username"
            labelPlacement="outside"
            placeholder="my-social-agent"
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
            labelPlacement="outside"
            placeholder="https://my-agent.example.com"
            value={formData.base_url}
            onValueChange={(v) => handleChange("base_url", v)}
            errorMessage={errors.base_url}
            isInvalid={!!errors.base_url}
          />

          <Input
            label="Run Every (hours)"
            labelPlacement="outside"
            placeholder="24"
            type="number"
            value={formData.run_after_every_hours}
            onValueChange={(v) => handleChange("run_after_every_hours", v)}
          />

          <Button
            type="submit"
            variant="flat"
            color="success"
            className="w-full mt-2"
            isLoading={isLoading}
            startContent={<IconPlus size={18} />}
          >
            Create Agent
          </Button>
        </div>
      </form>
    </div>
  );
}
