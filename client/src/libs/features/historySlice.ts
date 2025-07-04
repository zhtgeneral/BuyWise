import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

export interface RecommendedProduct {
  id: string;
  source: string;
  title: string;
  image: string;
  price: number;
  url: string;
  rating?: number;
  reviews?: number;
}

export interface ChatMessage {
  speaker: 'user' | 'bot';
  text: string;
  timestamp?: string;
  recommendedProducts?: RecommendedProduct[];
}

export interface ChatHistory {
  _id: string;
  messages: ChatMessage[];
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

interface HistoryState {
  chats: ChatHistory[];
  activeChatId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: HistoryState = {
  chats: [],
  activeChatId: null,
  loading: false,
  error: null,
};

export const fetchChatHistory = createAsyncThunk(
  'history/fetchChatHistory',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:3000/api/chats?email=${encodeURIComponent(email)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch chat history');
      }
      const data = await response.json();
      return data.chats || data.chat || data || [];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Unknown error');
    }
  }
);

export const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    setChats: (state, action: PayloadAction<ChatHistory[]>) => {
      state.chats = action.payload;
      state.error = null;
    },
    setActiveChatId: (state, action: PayloadAction<string | null>) => {
      state.activeChatId = action.payload;
    },
    clearChats: (state) => {
      state.chats = [];
      state.activeChatId = null;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChatHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChatHistory.fulfilled, (state, action: PayloadAction<ChatHistory[]>) => {
        // chats array is now properly extracted in the thunk
        state.chats = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchChatHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch chat history';
      });
  },
});

export const { setChats, setActiveChatId, clearChats, setLoading, setError } = historySlice.actions;
export const selectChats = (state: any) => state.history?.chats || [];
export const selectActiveChatId = (state: any) => state.history?.activeChatId || null;
export const selectHistoryLoading = (state: any) => state.history?.loading || false;
export const selectHistoryError = (state: any) => state.history?.error || null;
export default historySlice.reducer;
