import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/utils/api";
import {
  User,
  PublicUser,
  RegisterPayload,
  LoginPayload,
  UpdateUserPayload,
} from "@/types/user";

interface AuthState {
  user: User | null;
  searchedUsers: PublicUser[];
  viewedUser: PublicUser | null;
  agentDeveloper: PublicUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSearchingUsers: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  searchedUsers: [],
  viewedUser: null,
  agentDeveloper: null,
  isAuthenticated: false,
  isLoading: false,
  isSearchingUsers: false,
  error: null,
};

export const registerUser = createAsyncThunk(
  "auth/register",
  async (payload: RegisterPayload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/auth/register", payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed",
      );
    }
  },
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/auth/login", payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  },
);

export const getUser = createAsyncThunk(
  "auth/getUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/user");
      return response.data as User;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user",
      );
    }
  },
);

export const updateUser = createAsyncThunk(
  "auth/updateUser",
  async (payload: UpdateUserPayload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put("/user", payload);
      return response.data as User;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update user",
      );
    }
  },
);

export const searchUsers = createAsyncThunk(
  "auth/searchUsers",
  async (query: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/user/search?q=${encodeURIComponent(query)}`,
      );
      return response.data as PublicUser[];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to search users",
      );
    }
  },
);

export const fetchUserByUsername = createAsyncThunk(
  "auth/fetchUserByUsername",
  async (username: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/user/username/${username}`);
      return response.data as PublicUser;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user",
      );
    }
  },
);

export const fetchUserById = createAsyncThunk(
  "auth/fetchUserById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/user/id/${id}`);
      return response.data as PublicUser;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch developer",
      );
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSearchedUsers: (state) => {
      state.searchedUsers = [];
    },
    clearViewedUser: (state) => {
      state.viewedUser = null;
    },
    clearAgentDeveloper: (state) => {
      state.agentDeveloper = null;
    },
  },
  extraReducers: (builder) => {
    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get User
    builder
      .addCase(getUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Update User
    builder
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Search Users
    builder
      .addCase(searchUsers.pending, (state) => {
        state.isSearchingUsers = true;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.isSearchingUsers = false;
        state.searchedUsers = action.payload;
      })
      .addCase(searchUsers.rejected, (state) => {
        state.isSearchingUsers = false;
      });

    // Fetch User by Username
    builder
      .addCase(fetchUserByUsername.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserByUsername.fulfilled, (state, action) => {
        state.isLoading = false;
        state.viewedUser = action.payload;
      })
      .addCase(fetchUserByUsername.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch User by ID (Developer)
    builder.addCase(fetchUserById.fulfilled, (state, action) => {
      state.agentDeveloper = action.payload;
    });
  },
});

export const {
  logout,
  clearError,
  clearSearchedUsers,
  clearViewedUser,
  clearAgentDeveloper,
} = authSlice.actions;
export default authSlice.reducer;
