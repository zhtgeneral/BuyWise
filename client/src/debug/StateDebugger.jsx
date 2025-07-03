import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectProfile } from '../libs/features/profileSlice';
import { selectIsAuthenticated } from '../libs/features/authenticationSlice';

/**
 * This function periodically shows the frontend redux state.
 * 
 * Set active to true to enable logging in the browser dev console.
 */
export default function StateDebugger({
  active = false
}) {
  const currentProfile = useSelector(selectProfile);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useEffect(() => {
    if (!active) return;

    function checkProfile() {
      console.log('StateDebugger redux profile:', JSON.stringify(currentProfile, null, 2));
      console.log("StateDebugger isAuthenticated: " + isAuthenticated);
    };
    checkProfile();

    const intervalId = setInterval(checkProfile, 5000);

    return () => clearInterval(intervalId);
  }, [currentProfile, isAuthenticated, active]); 
}