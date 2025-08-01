import { configureStore, combineReducers, Reducer } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storageSession from 'redux-persist/lib/storage/session'; 
import { encryptTransform } from 'redux-persist-transform-encrypt';

import profileReducer from './features/profileSlice';
import productsReducer from './features/productsSlice';
import chatReducer from './features/chatSlice';
import authenticationReducer from './features/authenticationSlice';
import historyReducer from './features/historySlice';

const encryptor = encryptTransform({
  secretKey: 'BuyWise-Secret-Key',// TODO replace
  onError: function (error) {
    console.error('Redux Encryption error:', error);
  },
});

const persistConfig = {
  key: 'root',
  storage: storageSession,
  whitelist: ['profile', 'history'],
  transforms: [encryptor]
};

const rootReducer: Reducer<RootState> = combineReducers({
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

export const persistor = persistStore(store);

// export type RootState = ReturnType<typeof store.getState>;
interface RootState {
  profile: ReturnType<typeof profileReducer>;
  products: ReturnType<typeof productsReducer>;
  chat: ReturnType<typeof chatReducer>;
  authentication: ReturnType<typeof authenticationReducer>;
  history: ReturnType<typeof historyReducer>;
}
export type AppDispatch = typeof store.dispatch;