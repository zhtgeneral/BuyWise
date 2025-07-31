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
      name: preferences.name,
      country: preferences.country,
      max_products_per_search: preferences.max_products_per_search,
      price_sort_preference: preferences.price_sort_preference,
      allow_ai_personalization: preferences.allow_ai_personalization,
      response_style: preferences.response_style,
      minimum_rating_threshold: preferences.minimum_rating_threshold,
      exclude_unrated_products: preferences.exclude_unrated_products,
    }
  }
  dispatch(updateProfile(updatedProfile)); 
  dispatch(validateAuth(null));
  dispatch(setChats(history));
}