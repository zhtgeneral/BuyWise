import { useAuth0 } from '@auth0/auth0-react';
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface userPreferences {
  id: string | null,
  storagePreference: string;
  RAMPreference: string;
  brandPreference: string,
  minBudget: number,
  maxBudget: number,
  ratingPreference: number
  country: string,
}

interface userOptions {
  username: string,
  email: string,  
}

interface Preferences {
  userOptions: userOptions,
  userPreferences: userPreferences
}

const initialState: Preferences = {
  userOptions: {
    username: "No username",
    email: "No email"
  },
  userPreferences: {
    id: null,
    storagePreference: '128GB',
    RAMPreference: '2GB',
    brandPreference: "None",
    minBudget: 100,
    maxBudget: 1000,
    ratingPreference: 3,
    country: "Canada",
  }
};


export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    /** 
     * This updates the user in the state.
     */
    updateUser: (state, action: PayloadAction<Preferences>) => {
      state.userOptions = {
        ...state.userOptions,
        username: action.payload.userOptions.username,
        email: action.payload.userOptions.email,
      }
      state.userPreferences = {
        ...state.userPreferences,
        ...action.payload.userPreferences
      }
    },
  },
});

/** Reducer actions to modify user's state */
export const { 
  updateUser, 
} = userSlice.actions;

/** Selector functions to access read only state for user */
export const selectUserOptions = (state) => state.user.userOptions;
export const selectUserPreferences = (state) => state.user.userPreferences;
export const selectUser = (state) => state.user;

export default userSlice.reducer;