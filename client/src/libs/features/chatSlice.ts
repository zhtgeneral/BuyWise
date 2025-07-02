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
}

const initialState: ChatState = {
  messages: [],
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
    },
    setChat: (state, action: PayloadAction<ChatMessage[]>) => {
      state.messages = action.payload;
    },
  },
});

export const { addMessage, clearChat, setChat } = chatSlice.actions;
export const selectChatMessages = (state) => state.chat.messages;
export default chatSlice.reducer;