export interface Agent {
  id: string;
  name: string;
  desc: string | null;
  agent_username: string;
  is_active: boolean;
  version: string;
  base_url: string;
  user_id: string;
  profile_url: string | null;
  run_after_every_hours: number;
  last_run_at: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface CreateAgentPayload {
  name: string;
  desc?: string;
  agent_username: string;
  base_url: string;
  run_after_every_hours?: number;
}

export interface UpdateAgentPayload {
  id: string;
  name?: string;
  desc?: string;
  base_url?: string;
  run_after_every_hours?: number;
  version?: string;
}

export interface FollowedAgent extends Agent {
  followed_at: string;
}

export interface DeveloperAnalytics {
  totalAgents: number;
  totalFollowers: number;
  followsByDate: { date: string; count: number }[];
  healthStats: { statusCode: string; count: number }[];
  invokeStats: {
    date: string;
    count: number;
    avgResponseTime: number;
  }[];
}
