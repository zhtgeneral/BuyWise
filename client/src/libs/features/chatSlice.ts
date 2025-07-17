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
  conversationId: string | null; // Track the MongoDB _id for the current conversation
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
      state.conversationId = null; // Clear conversation ID when clearing chat
    },
    setChat: (state, action: PayloadAction<ChatMessage[]>) => {
      state.messages = action.payload;
    },
    setConversationId: (state, action: PayloadAction<string | null>) => {
      state.conversationId = action.payload;
    },
    // Action for starting a new conversation
    startNewConversation: (state) => {
      state.messages = [];
      state.conversationId = null;
    },
  },
});

export const { addMessage, clearChat, setChat, setConversationId, startNewConversation } = chatSlice.actions;
export const selectChatMessages = (state) => state.chat.messages;
export const selectConversationId = (state) => state.chat.conversationId;
export default chatSlice.reducer;