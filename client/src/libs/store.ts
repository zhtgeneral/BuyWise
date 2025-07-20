import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; 
import profileReducer from './features/profileSlice';
import productsReducer from './features/productsSlice';
import chatReducer from './features/chatSlice';
import authenticationReducer from './features/authenticationSlice';
import historyReducer from './features/historySlice';

// Persist configuration
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['profile'], // Only persist the profile slice
};


const rootReducer = combineReducers({
  profile: profileReducer,
  products: productsReducer,
  chat: chatReducer,
  authentication: authenticationReducer,
  history: historyReducer,
});


const persistedReducer = persistReducer(persistConfig, rootReducer);

/**
 * This holds the global states.
 *
 * Each slice sends a reducer to the store.
 */
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Create persistor
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;