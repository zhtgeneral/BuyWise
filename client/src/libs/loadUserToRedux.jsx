import { useAuth0 } from "@auth0/auth0-react";
import { useDispatch } from 'react-redux';
import { updateUser } from './features/userSlice';

const debug = true;

/**
 * This function loads the user from the session and populates the state for redux.
 * TODO get the user's preferences from DB
 */
export default function LoadUserFromAuthToRedux() {
  const { user } = useAuth0();
  const dispatch = useDispatch();  

  if (!user) return;

  const userData = {
    userOptions: {
      username: user.nickname,
      email: user.email
    },
    // Default preferences. TODO fetch from DB
    userPreferences: {
      budgetMin: 100,
      budgetMax: 1000,
      brandPreference: "None",
      country: "Canada",
      ratingPreference: 4
    }
  };
  
  dispatch(updateUser(userData));

  if (debug) {
    console.log(JSON.stringify(user, null, 2))
  }
}