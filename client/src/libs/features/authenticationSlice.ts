import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Browser from '../../utils/browser';


interface AuthenticatedState {
  isAuthenticated: boolean
}

const initialState: AuthenticatedState = {
  isAuthenticated: false
};

const authenticationSlice = createSlice({
  name: 'authentication',
  initialState,
  reducers: {
    /**
     * Optional admin function to directly control the authenticated state.
     */
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload || false
    },
    /**
     * This function checks if the token is stored in the local storage.
     * 
     * If so, it sets the authenticated state as true
     */
    validateAuth: (state, action?) => {
      Browser.getToken()? state.isAuthenticated = true : state.isAuthenticated = false;
    }
  },
});

export const { setAuthenticated, validateAuth } = authenticationSlice.actions;
export const selectIsAuthenticated = (state) => state.authentication.isAuthenticated
export default authenticationSlice.reducer;