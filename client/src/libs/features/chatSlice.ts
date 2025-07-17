import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
  conversationId: string | null;
}

const initialState: ChatState = {
  messages: [],
  conversationId: null,
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
    },
    clearChat: (state) => {
      state.messages = [];
      state.conversationId = null;
    },
    setConversationId: (state, action: PayloadAction<string | null>) => {
      state.conversationId = action.payload;
    },
    loadPastChat: (state, action: PayloadAction<{ chatId: string; messages: ChatMessage[] }>) => {
      const { chatId, messages } = action.payload;
      state.messages = messages;
      state.conversationId = chatId;
    },
  },
});

export const { addMessage, clearChat, setConversationId, loadPastChat } = chatSlice.actions;
export const selectChatMessages = (state) => state.chat.messages;
export const selectConversationId = (state) => state.chat.conversationId;
export default chatSlice.reducer;