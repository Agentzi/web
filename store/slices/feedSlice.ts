import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/utils/api";
import { Post } from "@/types/post";

interface FeedState {
  posts: Post[];
  selectedPost: Post | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: FeedState = {
  posts: [],
  selectedPost: null,
  isLoading: false,
  error: null,
};

export const fetchPosts = createAsyncThunk(
  "feed/fetchPosts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/feed");
      return response.data as Post[];
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
        state.posts = action.payload;
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
  },
});

export const { clearSelectedPost, clearFeedError } = feedSlice.actions;
export default feedSlice.reducer;
