import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface preferenceInfo {
  storage_preference: string;
  RAM_preference: string;
  brand_preference: string,
  min_budget: number,
  max_budget: number,
  rating_preference: number
  country: string,
}

interface userInfo {
  _id: string,
  name: string,
  email: string,  
  isEmailVerified: boolean
}

interface Profile {
  user: userInfo,
  preferences: preferenceInfo
}

/**
 * Strategy:
 * Store the user in a store, plus the preferences
 * Every time /profile is visited, the cached profile is saved!
 */
const initialState: Profile = {
  user: {
    _id: 'No id',
    name: "No name",
    email: "No email",
    isEmailVerified: false,
  },
  preferences: {
    storage_preference: '128GB',
    RAM_preference: '2GB',
    brand_preference: "None",
    min_budget: 100,
    max_budget: 1000,
    rating_preference: 3,
    country: "Canada",
  }
};


export const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    /** 
     * This updates the user in the state.
     * 
     * Make sure preferences has only certain fields. Keep out address, createdAt, updatedAt, email
     * as the frontend doesn't need those fields
     */
    updateProfile: (state, action: PayloadAction<Profile>) => {
      const { user, preferences } = action.payload;
      state.user = {
        ...user
      }
      state.preferences = {
        ...preferences
      }
      console.log("redux profile: " + JSON.stringify(state, null, 2));
    },
  },
});

/** Reducer actions to modify user's state */
export const { 
  updateProfile, 
} = profileSlice.actions;

/** Selector functions to access read only state for user */
export const selectProfileUser = (state) => state.profile.user;
export const selectProfilePreferences = (state) => state.profile.preferences;
export const selectProfile = (state) => state.profile

export default profileSlice.reducer;