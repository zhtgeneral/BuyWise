import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface preferenceInfo {
  name: string;
  country: string;
  max_products_per_search: number;
  price_sort_preference: string;
  allow_ai_personalization: boolean;
  response_style: string;
  minimum_rating_threshold: number;
  exclude_unrated_products: boolean;
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
    name: "No name",
    country: "Canada",
    max_products_per_search: 3,
    price_sort_preference: "lowest_first",
    allow_ai_personalization: true,
    response_style: "conversational",
    minimum_rating_threshold: 3,
    exclude_unrated_products: false,
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