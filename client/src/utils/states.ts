import { updateProfile } from '../libs/features/profileSlice';
import { validateAuth } from '../libs/features/authenticationSlice';
import { setChats } from '../libs/features/historySlice';

/**
 * Save user to redux store for use around the app and validate authenticated state.
 */
export function saveStates(user, preferences, history, dispatch) {
  const updatedProfile = {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      isEmailVerified: user.isEmailVerified
    },          
    preferences: {
      storage_preference: preferences.storage_preference,
      RAM_preference: preferences.RAM_preference,
      brand_preference: preferences.brand_preference,
      min_budget: preferences.min_budget,
      max_budget: preferences.max_budget,
      rating_preference: preferences.rating_preference,
      country: preferences.country,
    }
  }
  dispatch(updateProfile(updatedProfile)); 
  dispatch(validateAuth(null));
  dispatch(setChats(history));
}