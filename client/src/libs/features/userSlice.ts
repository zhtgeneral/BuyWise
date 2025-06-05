import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface userPreferences {
  budgetMin: number,
  budgetMax: number,
  brandPreference: string,
  country: string,
  ratingPreference: number
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
    username: "Username",
    email: "temp@mail.ca"
  },
  userPreferences: {
    budgetMin: 100,
    budgetMax: 1000,
    brandPreference: "None",
    country: "Canada",
    ratingPreference: 4
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
        /** Note email is not editable even if it passes through */
        username: action.payload.userOptions.username,
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