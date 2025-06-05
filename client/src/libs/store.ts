import { configureStore } from '@reduxjs/toolkit';
import userReducer from './features/userSlice';

/**
 * This holds the global states.
 * 
 * Each slice sends a reducer to the store.
 */
export const store = configureStore({
  reducer: {
    user: userReducer
  },
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
