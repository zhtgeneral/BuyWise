import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ChatMessage {
  speaker: 'user' | 'bot';
  text: string;
  timestamp?: string;
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