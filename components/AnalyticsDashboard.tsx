"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/store";
import {
  fetchDeveloperAnalytics,
  fetchAgentByDevId,
} from "@/store/slices/agentSlice";
import { Spinner } from "@heroui/spinner";
import { Select, SelectItem } from "@heroui/select";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Accordion, AccordionItem } from "@heroui/accordion";
import {
  IconUsers,
  IconRobot,
  IconActivity,
  IconBolt,
} from "@tabler/icons-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function AnalyticsDashboard() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { analyticsData, isLoadingAnalytics, agents } = useAppSelector(
    (state) => state.agent,
  );

  const [selectedAgentId, setSelectedAgentId] = useState<string>("all");

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchAgentByDevId(user.id));
    }
  }, [dispatch, user?.id]);

  useEffect(() => {
    dispatch(
      fetchDeveloperAnalytics(
        selectedAgentId === "all" ? undefined : selectedAgentId,
      ),
    );
  }, [dispatch, selectedAgentId]);

  const healthPieData = useMemo(() => {
    if (!analyticsData?.healthStats) return [];
    return analyticsData.healthStats.map((stat, idx) => ({
      name: `HTTP ${stat.statusCode}`,
      value: stat.count,
      color: stat.statusCode.startsWith("2")
        ? "#10b981"
        : stat.statusCode.startsWith("4") || stat.statusCode.startsWith("5")
          ? "#ef4444"
          : COLORS[idx % COLORS.length],
    }));
  }, [analyticsData?.healthStats]);

  if (isLoadingAnalytics || !analyticsData) {
    return (
      <div className="flex h-full w-full justify-center items-center">
        <Spinner size="lg" color="default" label="Loading Analytics..." />
      </div>
    );
  }

  const {
    totalAgents,
    totalFollowers,
    followsByDate,
    invokeStats,
    recentLogs,
  } = analyticsData;

  const hasData =
    followsByDate.length > 0 ||
    healthPieData.length > 0 ||
    invokeStats.length > 0 ||
    (recentLogs && recentLogs.length > 0);

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-10 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-bold tracking-tight">
            Analytics Overview
          </h1>
          <p className="text-default-500 text-sm">
            Monitor your agents&apos; performance, engagement, and health.
          </p>
        </div>

        <div className="w-full md:w-64">
          <Select
            label="Filter by Agent"
            className="w-full"
            variant="flat"
            selectedKeys={[selectedAgentId]}
            onChange={(e) => setSelectedAgentId(e.target.value)}
            items={[
              { id: "all", name: "All Agents", username: "" },
              ...agents
                .filter((a) => a.user_id === user?.id)
                .map((a) => ({
                  id: a.id,
                  name: a.name,
                  username: a.agent_username,
                })),
            ]}
          >
            {(agent) => (
              <SelectItem key={agent.id}>
                {agent.id === "all"
                  ? agent.name
                  : `${agent.name} (@${agent.username})`}
              </SelectItem>
            )}
          </Select>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border border-default-200">
          <CardBody className="flex flex-row items-center gap-4">
            <div className="flex flex-col">
              <p className="text-sm font-medium text-default-500">
                Total Agents
              </p>
              <p className="text-2xl font-bold">{totalAgents}</p>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-sm border border-default-200">
          <CardBody className="flex flex-row items-center gap-4">
            <div className="flex flex-col">
              <p className="text-sm font-medium text-default-500">
                Total Followers
              </p>
              <p className="text-2xl font-bold">{totalFollowers}</p>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-sm border border-default-200">
          <CardBody className="flex flex-row items-center gap-4">
            <div className="flex flex-col">
              <p className="text-sm font-medium text-default-500">
                Total Invokes
              </p>
              <p className="text-2xl font-bold">
                {invokeStats.reduce((acc, curr) => acc + curr.count, 0)}
              </p>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-sm border border-default-200">
          <CardBody className="flex flex-row items-center gap-4">
            <div className="flex flex-col">
              <p className="text-sm font-medium text-default-500">
                Avg Response
              </p>
              <p className="text-2xl font-bold">
                {invokeStats.length > 0
                  ? Math.round(
                      invokeStats.reduce(
                        (acc, curr) => acc + curr.avgResponseTime,
                        0,
                      ) / invokeStats.length,
                    ) > 1000
                    ? Math.round(
                        invokeStats.reduce(
                          (acc, curr) => acc + curr.avgResponseTime,
                          0,
                        ) / invokeStats.length,
                      ) / 1000
                    : Math.round(
                        invokeStats.reduce(
                          (acc, curr) => acc + curr.avgResponseTime,
                          0,
                        ) / invokeStats.length,
                      )
                  : 0}
                {invokeStats.length > 0
                  ? Math.round(
                      invokeStats.reduce(
                        (acc, curr) => acc + curr.avgResponseTime,
                        0,
                      ) / invokeStats.length,
                    ) > 1000
                    ? "s"
                    : "ms"
                  : "ms"}
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      {!hasData && (
        <Card className="mt-8 border-dashed border-2 shadow-none border-default-200 bg-transparent">
          <CardBody className="py-20 text-center flex flex-col items-center gap-3 text-default-500">
            <IconActivity size={48} className="opacity-50" />
            <p className="text-lg font-medium">No analytics data yet</p>
            <p className="text-sm">
              Data will appear here once your agents are used and followed.
            </p>
          </CardBody>
        </Card>
      )}

      {hasData && (
        <div className="flex flex-col gap-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
            {/* Follows Over Time Chart */}
            <Card className="shadow-sm border border-default-200">
              <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
                <h4 className="font-bold text-lg">Follows Over Time</h4>
                <p className="text-tiny text-default-500">
                  Growth of audience for your agents
                </p>
              </CardHeader>
              <CardBody className="overflow-hidden min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={followsByDate}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      opacity={0.3}
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickMargin={10}
                    />
                    <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      name="Follows"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>

            {/* Invokes Over Time Chart */}
            <Card className="shadow-sm border border-default-200">
              <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
                <h4 className="font-bold text-lg">Agent Usage</h4>
                <p className="text-tiny text-default-500">
                  Number of invocations daily
                </p>
              </CardHeader>
              <CardBody className="overflow-hidden min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={invokeStats}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      opacity={0.3}
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickMargin={10}
                    />
                    <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                      cursor={{ fill: "rgba(0,0,0,0.05)" }}
                    />
                    <Bar
                      dataKey="count"
                      name="Invokes"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>

            {/* Response Time Chart */}
            <Card className="shadow-sm border border-default-200">
              <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
                <h4 className="font-bold text-lg">Average Response Time</h4>
                <p className="text-tiny text-default-500">
                  Latency of invocations (ms)
                </p>
              </CardHeader>
              <CardBody className="overflow-hidden min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={invokeStats}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      opacity={0.3}
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickMargin={10}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="avgResponseTime"
                      name="Response Time (ms)"
                      stroke="#f59e0b"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>

            {/* Health Status Distribution */}
            <Card className="shadow-sm border border-default-200">
              <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
                <h4 className="font-bold text-lg">Health Status Codes</h4>
                <p className="text-tiny text-default-500">
                  Distribution of HTTP responses from Agents
                </p>
              </CardHeader>
              <CardBody className="overflow-hidden min-h-[300px] flex justify-center items-center">
                {healthPieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={healthPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {healthPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: "12px",
                          border: "none",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                      />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-default-400 text-sm">
                    No health check data available
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Recent Logs Accordion */}
          {recentLogs && recentLogs.length > 0 && (
            <Card className="shadow-sm border border-default-200 mt-4">
              <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
                <h4 className="font-bold text-lg">Recent HTTP Call Logs</h4>
                <p className="text-tiny text-default-500">
                  Latest agent invocations and health checks
                </p>
              </CardHeader>
              <CardBody>
                <Accordion variant="light">
                  {recentLogs.map((log) => {
                    const statusColor = log.status_code.startsWith("2")
                      ? "text-success"
                      : log.status_code.startsWith("4") ||
                          log.status_code.startsWith("5")
                        ? "text-danger"
                        : "text-warning";

                    return (
                      <AccordionItem
                        key={log.id}
                        aria-label={`Log ${log.id}`}
                        title={
                          <div className="flex flex-row items-center justify-between w-full">
                            <div className="flex flex-col gap-1 items-start w-1/3">
                              <span className="text-sm font-semibold">
                                {log.agent_name}
                              </span>
                              <span className="text-xs text-default-400">
                                {log.type}
                              </span>
                            </div>
                            <div className="flex flex-col gap-1 items-end w-1/3">
                              <span
                                className={`text-sm font-semibold ${statusColor}`}
                              >
                                {log.status_code}
                              </span>
                              <span className="text-xs text-default-400">
                                {new Date(log.created_at).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        }
                      >
                        <div className="flex flex-col gap-2 p-2 bg-default-50 rounded-lg">
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-semibold">Log ID:</span>
                            <span className="font-mono text-xs">{log.id}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-semibold">
                              Response Time:
                            </span>
                            <span>
                              {log.response_time_ms
                                ? `${log.response_time_ms}ms`
                                : "N/A"}
                            </span>
                          </div>
                        </div>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </CardBody>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
