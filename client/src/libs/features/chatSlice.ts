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

interface ChatState {
  messages: ChatMessage[];
}

const initialState: ChatState = {
  messages: [],
};

// Define the argument type for saving chat
interface SaveChatArgs {
  messages: ChatMessage[];
  email: string;
}

// Thunk to save the current chat to the backend
export const saveChatAsync = createAsyncThunk(
  'chat/saveChat',
  async ({ messages, email }: SaveChatArgs, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:3000/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ messages, email }),
      });
      if (!response.ok) {
        throw new Error('Failed to save chat');
      }
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Unknown error');
    }
  }
);

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
    },
    clearChat: (state) => {
      state.messages = [];
    },
    setChat: (state, action: PayloadAction<ChatMessage[]>) => {
      state.messages = action.payload;
    },
  },
});

export const { addMessage, clearChat, setChat } = chatSlice.actions;
export const selectChatMessages = (state) => state.chat.messages;
export default chatSlice.reducer;