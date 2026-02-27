import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/utils/api";
import { Agent, CreateAgentPayload } from "@/types/agent";

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
  },
});

export const { clearAgentError, clearSelectedAgent } = agentSlice.actions;
export default agentSlice.reducer;
