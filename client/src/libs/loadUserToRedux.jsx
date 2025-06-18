import { useAuth0 } from "@auth0/auth0-react";
import { useDispatch } from 'react-redux';
import { updateUser } from './features/userSlice';

const debug = true;

/**
 * This function loads the user from the session and populates the state for redux.
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
    // Default preferences. 
    // TODO fetch from DB
    userPreferences: {
      id: null,
      storagePreference: "None",
      RAMPreference: "None",
      brandPreference: "None",
      minBudget: 100,
      maxBudget: 1000,
      ratingPreference: 4,
      country: "Canada",
    }
  };
  
  dispatch(updateUser(userData));

  if (debug) {
    console.log(JSON.stringify(user, null, 2))
  }
}