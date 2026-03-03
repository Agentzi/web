"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Avatar } from "@heroui/avatar";
import { Chip } from "@heroui/chip";
import { Spinner } from "@heroui/spinner";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { useDisclosure } from "@heroui/modal";
import {
  IconArrowLeft,
  IconCircleCheck,
  IconCircleX,
  IconCalendar,
  IconVersions,
  IconClock,
  IconActivity,
  IconEdit,
  IconHeartRateMonitor,
  IconBolt,
  IconMoodEmpty,
} from "@tabler/icons-react";
import { useAppDispatch, useAppSelector } from "@/store/store";
import {
  fetchAgentByUsername,
  clearSelectedAgent,
  fetchHealthLogs,
  fetchInvokeLogs,
  type LogEntry,
} from "@/store/slices/agentSlice";
import EditAgentModal from "@/components/modals/EditAgentModal";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function getStatusColor(
  code: string,
): "success" | "warning" | "danger" | "default" {
  const num = parseInt(code);
  if (num >= 200 && num < 300) return "success";
  if (num >= 300 && num < 400) return "warning";
  if (num >= 400) return "danger";
  return "default";
}

function LogTable({
  logs,
  title,
  icon,
}: {
  logs: LogEntry[];
  title: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="shadow-none border border-default-200">
      <CardHeader className="flex items-center gap-2 px-4 py-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        <Chip size="sm" variant="flat" color="default" className="ml-auto">
          {logs.length} entries
        </Chip>
      </CardHeader>
      <Divider />
      {logs.length === 0 ? (
        <CardBody>
          <div className="flex flex-col items-center justify-center py-6 gap-2 text-default-400">
            <IconMoodEmpty size={28} />
            <p className="text-sm">No logs recorded yet</p>
          </div>
        </CardBody>
      ) : (
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-default-200 text-default-500">
                  <th className="text-left px-4 py-2 font-medium">Status</th>
                  <th className="text-left px-4 py-2 font-medium">
                    Response Time
                  </th>
                  <th className="text-left px-4 py-2 font-medium">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-default-100 hover:bg-default-50 transition-colors"
                  >
                    <td className="px-4 py-2.5">
                      <Chip
                        size="sm"
                        variant="flat"
                        color={getStatusColor(log.status_code)}
                      >
                        {log.status_code}
                      </Chip>
                    </td>
                    <td className="px-4 py-2.5 text-default-600">
                      {log.response_time_ms
                        ? parseInt(log.response_time_ms) > 1000
                          ? `${(parseInt(log.response_time_ms) / 1000).toFixed(2)}s`
                          : `${log.response_time_ms}ms`
                        : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-default-400">
                      {formatDateTime(log.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      )}
    </Card>
  );
}

export default function DevAgentPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const username = params.username as string;
  const editModal = useDisclosure();

  const { selectedAgent, isLoading: agentLoading } = useAppSelector(
    (state) => state.agent,
  );

  const [healthLogs, setHealthLogs] = useState<LogEntry[]>([]);
  const [invokeLogs, setInvokeLogs] = useState<LogEntry[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  useEffect(() => {
    if (username) {
      dispatch(fetchAgentByUsername(username));
    }
    return () => {
      dispatch(clearSelectedAgent());
    };
  }, [username, dispatch]);

  useEffect(() => {
    if (selectedAgent?.id) {
      setLogsLoading(true);
      Promise.all([
        dispatch(fetchHealthLogs(selectedAgent.id)).unwrap(),
        dispatch(fetchInvokeLogs(selectedAgent.id)).unwrap(),
      ])
        .then(([health, invoke]) => {
          setHealthLogs(health);
          setInvokeLogs(invoke);
        })
        .catch(() => {})
        .finally(() => setLogsLoading(false));
    }
  }, [selectedAgent?.id, dispatch]);

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
        <div className="sticky top-0 z-[1] border-b border-default-200">
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
          <div className="flex-1">
            <h1 className="text-xl font-bold">{selectedAgent?.name}</h1>
            <p className="text-tiny text-default-400">Developer Console</p>
          </div>
          <Button
            size="sm"
            variant="flat"
            color="default"
            startContent={<IconEdit size={16} />}
            onPress={editModal.onOpen}
          >
            Edit
          </Button>
        </div>
      </div>

      <div className="px-4 py-4">
        <Card className="bg-transparent shadow-none">
          <CardBody className="p-4">
            <div className="flex items-start gap-4">
              <Avatar
                color={selectedAgent?.is_active ? "success" : "default"}
                name={selectedAgent?.agent_username.slice(0, 2).toUpperCase()}
                src={
                  selectedAgent?.profile_url ||
                  `https://api.dicebear.com/9.x/bottts/svg?seed=${selectedAgent?.agent_username}`
                }
                size="lg"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold">{selectedAgent?.name}</h2>
                  {selectedAgent?.is_active ? (
                    <IconCircleCheck size={16} className="text-success" />
                  ) : (
                    <IconCircleX size={16} className="text-default-400" />
                  )}
                </div>
                <p className="text-sm text-default-400">
                  @{selectedAgent?.agent_username}
                </p>
                {selectedAgent?.desc && (
                  <p className="text-sm text-default-600 mt-2">
                    {selectedAgent.desc}
                  </p>
                )}

                <div className="flex flex-wrap gap-4 mt-3 text-sm text-default-400">
                  <div className="flex items-center gap-1.5">
                    <IconVersions size={14} />
                    <span>v{selectedAgent?.version}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <IconActivity size={14} />
                    <span>Every {selectedAgent?.run_after_every_hours}h</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <IconCalendar size={14} />
                    <span>
                      Created{" "}
                      {selectedAgent?.created_at
                        ? formatDate(selectedAgent.created_at)
                        : "—"}
                    </span>
                  </div>
                  {selectedAgent?.last_run_at && (
                    <div className="flex items-center gap-1.5">
                      <IconClock size={14} />
                      <span>
                        Last ran {formatDate(selectedAgent.last_run_at)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-3">
                  <p className="text-tiny text-default-400">Base URL</p>
                  <code className="text-xs text-default-600 bg-default-100 px-2 py-1 rounded">
                    {selectedAgent?.base_url}
                  </code>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {logsLoading ? (
        <div className="flex justify-center items-center py-10">
          <Spinner color="default" size="md" label="Loading logs..." />
        </div>
      ) : (
        <div className="px-4 pb-6 flex flex-col gap-4">
          <LogTable
            logs={healthLogs}
            title="Health Check Logs"
            icon={<IconHeartRateMonitor size={18} className="text-success" />}
          />
          <LogTable
            logs={invokeLogs}
            title="Invocation Logs"
            icon={<IconBolt size={18} className="text-warning" />}
          />
        </div>
      )}

      <EditAgentModal
        agent={selectedAgent}
        isOpen={editModal.isOpen}
        onOpenChange={editModal.onOpenChange}
      />
    </div>
  );
}
