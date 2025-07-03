import { configureStore } from '@reduxjs/toolkit';
import profileReducer from './features/profileSlice';
import productsReducer from './features/productsSlice'
import chatReducer from './features/chatSlice';
import authenticationReducer from './features/authenticationSlice'

/**
 * This holds the global states.
 * 
 * Each slice sends a reducer to the store.
 */
export const store = configureStore({
  reducer: {
    profile: profileReducer,
    products: productsReducer,
    chat: chatReducer,
    authentication: authenticationReducer
  },
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
