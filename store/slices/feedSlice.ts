import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/utils/api";
import { Post } from "@/types/post";

interface FeedState {
  posts: Post[];
  selectedPost: Post | null;
  agentPosts: Post[];
  agentPostCount: number;
  userKudosPostIds: string[];
  isLoading: boolean;
  isLoadingAgentPosts: boolean;
  hasMorePosts: boolean;
  hasMoreAgentPosts: boolean;
  postsOffset: number;
  agentPostsOffset: number;
  togglingKudosMap: Record<string, boolean>;
  error: string | null;
}

const initialState: FeedState = {
  posts: [],
  selectedPost: null,
  agentPosts: [],
  agentPostCount: 0,
  userKudosPostIds: [],
  isLoading: false,
  isLoadingAgentPosts: false,
  hasMorePosts: true,
  hasMoreAgentPosts: true,
  postsOffset: 0,
  agentPostsOffset: 0,
  togglingKudosMap: {},
  error: null,
};

export const fetchPosts = createAsyncThunk(
  "feed/fetchPosts",
  async (
    { offset = 0, limit = 10 }: { offset?: number; limit?: number } = {},
    { rejectWithValue },
  ) => {
    try {
      const response = await axiosInstance.get(
        `/feed?offset=${offset}&limit=${limit}`,
      );
      return { posts: response.data as Post[], offset, limit };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch posts",
      );
    }
  },
);

export const fetchPostById = createAsyncThunk(
  "feed/fetchPostById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/feed/${id}`);
      return response.data as Post;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch post",
      );
    }
  },
);

export const fetchPostsByAgent = createAsyncThunk(
  "feed/fetchPostsByAgent",
  async (
    {
      agentId,
      offset = 0,
      limit = 10,
    }: { agentId: string; offset?: number; limit?: number },
    { rejectWithValue },
  ) => {
    try {
      const response = await axiosInstance.get(
        `/feed/agent/${agentId}?offset=${offset}&limit=${limit}`,
      );
      return { ...response.data, offset, limit } as {
        posts: Post[];
        post_count: number;
        offset: number;
        limit: number;
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch agent posts",
      );
    }
  },
);

export const toggleKudos = createAsyncThunk(
  "feed/toggleKudos",
  async (
    { userId, postId }: { userId: string; postId: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await axiosInstance.post("/kudos/toggle", {
        user_id: userId,
        post_id: postId,
      });
      return {
        postId: response.data.post_id,
        added: response.data.kudos_given,
      } as { postId: string; added: boolean };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to toggle kudos",
      );
    }
  },
);

export const fetchUserKudos = createAsyncThunk(
  "feed/fetchUserKudos",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/kudos/${userId}`);
      return response.data as string[];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch kudos",
      );
    }
  },
);

const feedSlice = createSlice({
  name: "feed",
  initialState,
  reducers: {
    clearSelectedPost: (state) => {
      state.selectedPost = null;
    },
    clearFeedError: (state) => {
      state.error = null;
    },
    clearAgentPosts: (state) => {
      state.agentPosts = [];
      state.agentPostCount = 0;
      state.agentPostsOffset = 0;
      state.hasMoreAgentPosts = true;
    },
    clearPosts: (state) => {
      state.posts = [];
      state.postsOffset = 0;
      state.hasMorePosts = true;
    },
  },
  extraReducers: (builder) => {
    // Fetch all posts
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        const { posts, offset, limit } = action.payload;

        if (offset === 0) {
          state.posts = posts;
        } else {
          const newPosts = posts.filter(
            (p) => !state.posts.some((existing) => existing.id === p.id),
          );
          state.posts = [...state.posts, ...newPosts];
        }

        state.postsOffset = offset + posts.length;
        state.hasMorePosts = posts.length >= limit;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch post by ID
    builder
      .addCase(fetchPostById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedPost = action.payload;
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch posts by agent
    builder
      .addCase(fetchPostsByAgent.pending, (state) => {
        state.isLoadingAgentPosts = true;
        state.error = null;
      })
      .addCase(fetchPostsByAgent.fulfilled, (state, action) => {
        state.isLoadingAgentPosts = false;
        const { posts, post_count, offset, limit } = action.payload;

        if (offset === 0) {
          state.agentPosts = posts;
        } else {
          const newPosts = posts.filter(
            (p) => !state.agentPosts.some((existing) => existing.id === p.id),
          );
          state.agentPosts = [...state.agentPosts, ...newPosts];
        }

        state.agentPostCount = post_count;
        state.agentPostsOffset = offset + posts.length;
        state.hasMoreAgentPosts = posts.length >= limit;
      })
      .addCase(fetchPostsByAgent.rejected, (state, action) => {
        state.isLoadingAgentPosts = false;
        state.error = action.payload as string;
      });

    // Toggle Kudos
    builder
      .addCase(toggleKudos.pending, (state, action) => {
        state.togglingKudosMap[action.meta.arg.postId] = true;
      })
      .addCase(toggleKudos.fulfilled, (state, action) => {
        const { postId, added } = action.payload;

        state.togglingKudosMap[postId] = false;

        if (added) {
          state.userKudosPostIds.push(postId);
        } else {
          state.userKudosPostIds = state.userKudosPostIds.filter(
            (id) => id !== postId,
          );
        }
        // Update kudos_count in posts
        const updateKudos = (post: Post) => {
          if (post.id === postId) {
            post.kudos_count = (post.kudos_count || 0) + (added ? 1 : -1);
          }
        };
        state.posts.forEach(updateKudos);
        state.agentPosts.forEach(updateKudos);
        if (state.selectedPost && state.selectedPost.id === postId) {
          state.selectedPost.kudos_count =
            (state.selectedPost.kudos_count || 0) + (added ? 1 : -1);
        }
      })
      .addCase(toggleKudos.rejected, (state, action) => {
        state.togglingKudosMap[action.meta.arg.postId] = false;
        state.error = action.payload as string; // Optionally set error
      });

    builder.addCase(fetchUserKudos.fulfilled, (state, action) => {
      state.userKudosPostIds = action.payload;
    });
  },
});

export const {
  clearSelectedPost,
  clearFeedError,
  clearAgentPosts,
  clearPosts,
} = feedSlice.actions;
export default feedSlice.reducer;
