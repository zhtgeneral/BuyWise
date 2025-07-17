import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

// TODO remove async thunk and make login page fetch requests. Other components no longer fetch using useEffects.

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
  loading: boolean;
  error: string | null;
}

const initialState: HistoryState = {
  chats: [],
  loading: false,
  error: null,
};

// TODO remove since fetching chats is done in login component, not sidebar component
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
    clearChats: (state) => {
      state.chats = [];
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    addNewChatToHistory: (state, action: PayloadAction<ChatHistory>) => {
      state.chats.unshift(action.payload); // Add to beginning (most recent first)
    },
    updateChatInHistory: (state, action: PayloadAction<{ chatId: string; updatedChat: ChatHistory }>) => {
      const { chatId, updatedChat } = action.payload;
      const index = state.chats.findIndex(chat => chat._id === chatId);
      if (index !== -1) {
        state.chats[index] = updatedChat;
      }
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

export const { setChats, clearChats, setLoading, setError, addNewChatToHistory, updateChatInHistory } = historySlice.actions;
export const selectChats = (state: any) => state.history?.chats || [];
export const selectHistoryLoading = (state: any) => state.history?.loading || false;
export const selectHistoryError = (state: any) => state.history?.error || null;
export const selectChatById = (chatId: string) => (state: any) => 
  state.history?.chats?.find((chat: ChatHistory) => chat._id === chatId) || null;
export default historySlice.reducer;
