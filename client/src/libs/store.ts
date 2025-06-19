import { configureStore } from '@reduxjs/toolkit';
import userReducer from './features/userSlice';
import productsReducer from './features/productsSlice'
import chatReducer from './features/chatSlice';

/**
 * This holds the global states.
 * 
 * Each slice sends a reducer to the store.
 */
export const store = configureStore({
  reducer: {
    user: userReducer,
    products: productsReducer,
    chat: chatReducer
  },
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
