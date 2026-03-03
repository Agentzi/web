import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/utils/api";
import {
  Agent,
  FollowedAgent,
  CreateAgentPayload,
  UpdateAgentPayload,
  DeveloperAnalytics,
} from "@/types/agent";

interface AgentState {
  agents: Agent[];
  selectedAgent: Agent | null;
  followedAgents: FollowedAgent[];
  isLoading: boolean;
  isLoadingFollowed: boolean;
  error: string | null;
  isFollowing: boolean;
  followerCount: number;
  isTogglingFollow: boolean;
  analyticsData: DeveloperAnalytics | null;
  isLoadingAnalytics: boolean;
}

const initialState: AgentState = {
  agents: [],
  selectedAgent: null,
  followedAgents: [],
  isLoading: false,
  isLoadingFollowed: false,
  error: null,
  isFollowing: false,
  followerCount: 0,
  isTogglingFollow: false,
  analyticsData: null,
  isLoadingAnalytics: false,
};

export const createAgent = createAsyncThunk(
  "agent/create",
  async (payload: CreateAgentPayload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/agent/onboard", payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create agent",
      );
    }
  },
);

export const updateAgent = createAsyncThunk(
  "agent/update",
  async (payload: UpdateAgentPayload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put("/agent", payload);
      return response.data as Agent;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update agent",
      );
    }
  },
);

export const fetchAgentByUsername = createAsyncThunk(
  "agent/fetchByUsername",
  async (username: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/agent/username/${username}`);
      return response.data as Agent;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch agent",
      );
    }
  },
);

export const fetchAgentByDevId = createAsyncThunk(
  "agent/fetchByDevId",
  async (devId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/agent/dev/${devId}`);
      return response.data as Agent[];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch agent",
      );
    }
  },
);

export const toggleAgentState = createAsyncThunk(
  "agent/toggleState",
  async (agentId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/agent/toggle/${agentId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to toggle agent state",
      );
    }
  },
);

export const searchAgents = createAsyncThunk(
  "agent/search",
  async (query: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/agent/search?q=${encodeURIComponent(query)}`,
      );
      return response.data as Agent[];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to search agents",
      );
    }
  },
);

export interface LogEntry {
  id: string;
  agent_id: string;
  status_code: string;
  response_time_ms: string | null;
  created_at: string;
}

export const fetchHealthLogs = createAsyncThunk(
  "agent/fetchHealthLogs",
  async (agentId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/agent/health-logs/${agentId}`);
      return response.data as LogEntry[];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch health logs",
      );
    }
  },
);

export const fetchInvokeLogs = createAsyncThunk(
  "agent/fetchInvokeLogs",
  async (agentId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/agent/invoke-logs/${agentId}`);
      return response.data as LogEntry[];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch invoke logs",
      );
    }
  },
);

export const uploadAgentImage = createAsyncThunk(
  "agent/uploadImage",
  async (
    { agentId, file }: { agentId: string; file: File },
    { rejectWithValue },
  ) => {
    try {
      const formData = new FormData();
      formData.append("image", file);
      const response = await axiosInstance.post(
        `/agent/upload/${agentId}`,
        formData,
      );
      return response.data as Agent;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to upload agent image",
      );
    }
  },
);

export const toggleFollowAgent = createAsyncThunk(
  "agent/toggleFollow",
  async (agentId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/agent/follow/${agentId}`);
      return response.data as { agent_id: string; is_following: boolean };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to toggle follow",
      );
    }
  },
);

export const fetchFollowStatus = createAsyncThunk(
  "agent/fetchFollowStatus",
  async (agentId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/agent/follow-status/${agentId}`,
      );
      return response.data as { is_following: boolean };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch follow status",
      );
    }
  },
);

export const fetchFollowerCount = createAsyncThunk(
  "agent/fetchFollowerCount",
  async (agentId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/agent/followers/${agentId}`);
      return response.data as { count: number };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch follower count",
      );
    }
  },
);

export const fetchFollowedAgentsDetails = createAsyncThunk(
  "agent/fetchFollowedAgentsDetails",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/agent/following/details");
      return response.data as FollowedAgent[];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch followed agents",
      );
    }
  },
);

export const fetchDeveloperAnalytics = createAsyncThunk(
  "agent/fetchDeveloperAnalytics",
  async (agentId: string | undefined, { rejectWithValue }) => {
    try {
      let url = "/agent/analytics";
      if (agentId) {
        url += `?agent_id=${agentId}`;
      }
      const response = await axiosInstance.get(url);
      return response.data as DeveloperAnalytics;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch analytics",
      );
    }
  },
);

const agentSlice = createSlice({
  name: "agent",
  initialState,
  reducers: {
    clearAgentError: (state) => {
      state.error = null;
    },
    clearSelectedAgent: (state) => {
      state.selectedAgent = null;
      state.isFollowing = false;
      state.followerCount = 0;
      state.isTogglingFollow = false;
    },
    toggleAgentStateLocal: (state, action) => {
      const agentId = action.payload;
      const agent = state.agents.find((a) => a.id === agentId);
      if (agent) {
        agent.is_active = !agent.is_active;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createAgent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createAgent.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(createAgent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(updateAgent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateAgent.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedFields = action.payload;
        const index = state.agents.findIndex((a) => a.id === updatedFields.id);
        if (index !== -1) {
          state.agents[index] = { ...state.agents[index], ...updatedFields };
        }
        if (state.selectedAgent?.id === updatedFields.id) {
          state.selectedAgent = { ...state.selectedAgent, ...updatedFields };
        }
      })
      .addCase(updateAgent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchAgentByDevId.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAgentByDevId.fulfilled, (state, action) => {
        state.isLoading = false;
        const agentsList = action.payload;
        state.agents = agentsList;
        if (agentsList.length > 0) {
          state.selectedAgent = agentsList[0];
        }
      })
      .addCase(fetchAgentByDevId.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchAgentByUsername.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAgentByUsername.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedAgent = action.payload;
        const exists = state.agents.find((a) => a.id === action.payload.id);
        if (!exists) {
          state.agents.push(action.payload);
        }
      })
      .addCase(fetchAgentByUsername.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(searchAgents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchAgents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.agents = action.payload;
      })
      .addCase(searchAgents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(uploadAgentImage.pending, (state) => {
        state.error = null;
      })
      .addCase(uploadAgentImage.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.agents.findIndex((a) => a.id === updated.id);
        if (idx !== -1) {
          state.agents[idx] = {
            ...state.agents[idx],
            profile_url: updated.profile_url,
          };
        }
        if (state.selectedAgent?.id === updated.id) {
          state.selectedAgent = {
            ...state.selectedAgent,
            profile_url: updated.profile_url,
          };
        }
      })
      .addCase(uploadAgentImage.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Toggle Follow
    builder
      .addCase(toggleFollowAgent.pending, (state) => {
        state.isTogglingFollow = true;
      })
      .addCase(toggleFollowAgent.fulfilled, (state, action) => {
        state.isTogglingFollow = false;
        state.isFollowing = action.payload.is_following;
        state.followerCount += action.payload.is_following ? 1 : -1;
      })
      .addCase(toggleFollowAgent.rejected, (state, action) => {
        state.isTogglingFollow = false;
        state.error = action.payload as string;
      });

    // Fetch Follow Status
    builder.addCase(fetchFollowStatus.fulfilled, (state, action) => {
      state.isFollowing = action.payload.is_following;
    });

    // Fetch Follower Count
    builder.addCase(fetchFollowerCount.fulfilled, (state, action) => {
      state.followerCount = action.payload.count;
    });

    // Fetch Followed Agents Details
    builder
      .addCase(fetchFollowedAgentsDetails.pending, (state) => {
        state.isLoadingFollowed = true;
      })
      .addCase(fetchFollowedAgentsDetails.fulfilled, (state, action) => {
        state.isLoadingFollowed = false;
        state.followedAgents = action.payload;
      })
      .addCase(fetchFollowedAgentsDetails.rejected, (state) => {
        state.isLoadingFollowed = false;
      });

    // Fetch Developer Analytics
    builder
      .addCase(fetchDeveloperAnalytics.pending, (state) => {
        state.isLoadingAnalytics = true;
        state.error = null;
      })
      .addCase(fetchDeveloperAnalytics.fulfilled, (state, action) => {
        state.isLoadingAnalytics = false;
        state.analyticsData = action.payload;
      })
      .addCase(fetchDeveloperAnalytics.rejected, (state, action) => {
        state.isLoadingAnalytics = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearAgentError, clearSelectedAgent, toggleAgentStateLocal } =
  agentSlice.actions;
export default agentSlice.reducer;
