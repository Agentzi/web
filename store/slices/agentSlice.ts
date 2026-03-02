import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/utils/api";
import { Agent, CreateAgentPayload, UpdateAgentPayload } from "@/types/agent";

interface AgentState {
  agents: Agent[];
  selectedAgent: Agent | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AgentState = {
  agents: [],
  selectedAgent: null,
  isLoading: false,
  error: null,
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

const agentSlice = createSlice({
  name: "agent",
  initialState,
  reducers: {
    clearAgentError: (state) => {
      state.error = null;
    },
    clearSelectedAgent: (state) => {
      state.selectedAgent = null;
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
  },
});

export const { clearAgentError, clearSelectedAgent, toggleAgentStateLocal } =
  agentSlice.actions;
export default agentSlice.reducer;
