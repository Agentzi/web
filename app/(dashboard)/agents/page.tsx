"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@heroui/input";
import { Avatar } from "@heroui/avatar";
import { Spinner } from "@heroui/spinner";
import { Button } from "@heroui/button";
import { useDisclosure } from "@heroui/modal";
import {
  IconSearch,
  IconRobot,
  IconPlus,
  IconCircleCheck,
  IconCircleX,
} from "@tabler/icons-react";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { searchAgents } from "@/store/slices/agentSlice";
import CreateAgentModal from "@/components/modals/CreateAgentModal";

export default function AgentsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { agents, isLoading } = useAppSelector((state) => state.agent);
  const [query, setQuery] = useState("");
  const createModal = useDisclosure();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastQueryRef = useRef("");

  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        if (value !== lastQueryRef.current) {
          lastQueryRef.current = value;
          dispatch(searchAgents(value));
        }
      }, 500);
    },
    [dispatch],
  );

  return (
    <div className="w-full">
      {/* Sticky header */}
      <div className="sticky top-0 z-[1] bg-background/90 backdrop-blur-md border-b border-default-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-xl font-bold">Agents</h1>
            <p className="text-tiny text-default-400">
              Discover and explore AI agents
            </p>
          </div>
          <Button
            variant="flat"
            color="success"
            startContent={<IconPlus size={16} />}
            onPress={createModal.onOpen}
          >
            Create
          </Button>
        </div>

        {/* Search bar */}
        <div className="px-4 pb-3">
          <Input
            placeholder="Search agents by username..."
            value={query}
            onValueChange={handleSearch}
            startContent={<IconSearch size={18} className="text-default-400" />}
            size="sm"
            variant="flat"
            classNames={{
              inputWrapper: "bg-default-100",
            }}
            isClearable
            onClear={() => handleSearch("")}
          />
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <Spinner color="default" size="lg" label="Searching agents..." />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && agents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-default-400">
          <IconRobot size={48} />
          <p className="text-lg font-medium">No agents found</p>
          <p className="text-sm">
            {query
              ? "Try a different search term"
              : "No agents have been created yet"}
          </p>
        </div>
      )}

      {/* Agents list */}
      {!isLoading && agents.length > 0 && (
        <div className="flex flex-col">
          {agents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => router.push(`/agents/${agent.agent_username}`)}
              className="cursor-pointer flex items-center gap-3 px-4 py-3 hover:bg-default-50 transition-colors duration-200 border-b border-default-200 text-left w-full"
            >
              <Avatar
                className="flex-shrink-0"
                color={agent.is_active ? "success" : "default"}
                src={
                  agent.profile_url ||
                  `https://api.dicebear.com/9.x/bottts/svg?seed=${agent.agent_username}`
                }
                name={agent.agent_username.slice(0, 2).toUpperCase()}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold truncate">{agent.name}</p>
                  {agent.is_active ? (
                    <IconCircleCheck size={12} />
                  ) : (
                    <IconCircleX size={12} />
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
              <span className="text-tiny text-default-400 flex-shrink-0">
                v{agent.version}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Create Agent Modal */}
      <CreateAgentModal
        isOpen={createModal.isOpen}
        onOpenChange={createModal.onOpenChange}
      />
    </div>
  );
}
