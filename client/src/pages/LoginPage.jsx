import React from 'react';
import '../styles/AuthPage.css';
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { updateProfile } from '../libs/features/profileSlice';
import { validateAuth } from '../libs/features/authenticationSlice';
import { setChats } from '../libs/features/historySlice';
import { OrbitProgress } from 'react-loading-indicators'

const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export default function LoginPage() {
  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const context = { setLoading, email, password, navigate, dispatch };

  // Check if user is already logged in on component mount
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // User is already logged in, validate auth state and redirect to explore page
      dispatch(validateAuth());
      navigate('/explore-products');
    }
  }, [navigate, dispatch]);

  function handleRegister() {
    navigate('/registration');
  };

  return (
    <main className="login-container">
      <div className="login-scrollable">
        <div className="login-padding">
          <h1 className="login-header">Login</h1>
          <span>
            <div className="login-field">
              <label className="login-field__label">Email:</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Email"
                className="login-field__input"
                data-testid="email-input"
              />
            </div>
            <div className="login-field">
              <label className="login-field__label">Password:</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                className="login-field__input"
                data-testid="password-input"
              />
            </div>
          </span>
          <div className="auth-actions">
            <button className="auth-button secondary" onClick={handleRegister} data-testid="register-button">Register</button>
            <button className="auth-button primary" onClick={() => handleLogin(context)} disabled={loading} data-testid="login-button">
              <ConditionalLoadingIndicator isLoading={loading}/>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

/**
 * This is the main function that starts the app
 * 
 * - logs the user in using the auth API
 * - fetches the profile using the profile API
 * - fetches the chat history using the chat API
 * 
 * Note: avoid using useEffect in standalone components and keep everything centralized here
 */
async function handleLogin(context) {
  const { setLoading, email, password, navigate, dispatch } = context;

  setLoading(true);

  try {
    const response = await axios.post(`${backendURL}/api/auth/login`, { 
      email: email,
      password: password
    });
    var userBody = response.data;
  } catch (error) {  
    alert(error.response?.data?.error || 'Login Failed'); 
    setLoading(false);
    return;
  } 

  if (!userBody.success || !userBody.token) {
    alert('Login failed: No token received'); 
    setLoading(false);
    return;
  }

  const userId = userBody.user._id;
  const token = userBody.token
  try {
    const response = await axios.get(`${backendURL}/api/profiles/${userId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    )
    var profileBody = response.data;
  } catch (error) {
    alert(error.response?.data?.error || 'Error related to fetching profile'); 
    setLoading(false);
    return;
  }

  const profile = profileBody.profile
  if (!profileBody.success || !profile) {
    alert('Login failed: Unable to fetch profile'); 
    setLoading(false);
    return;
  }

  try {
    const response = await axios.get(`${backendURL}/api/chats?email=${encodeURIComponent(email)}`)
    var historyBody = response.data;
  } catch (error) {
    alert(error.response?.data?.error || 'Error related to fetching chat history'); 
    setLoading(false);
    return;
  }

  if (!historyBody.success) {
    alert('Login Failed: Unable to fetch chat history'); 
    setLoading(false);
    return;
  }

  saveToBrowser(userBody.token);
  saveStates(userBody.user, profileBody.profile, historyBody.chats, dispatch);
  navigate('/');
}

/**
 * Store the token in localStorage
 */
function saveToBrowser(token) {
  localStorage.setItem('token', token); // TODO save using cookie
}

function ConditionalLoadingIndicator({
  isLoading
}) {
  if (isLoading) {
    return (
      <OrbitProgress 
        style={{ fontSize: '6px' }} 
        color={["#77abd4", "#206599", "#77abd4", "#206599"]} 
        dense
        speedPlus='0'
        data-testid="loading-spinner"
      />
    )
  }
  return 'Login';
}

/**
 * Save user to redux store for use around the app and validate authenticated state.
 */
function saveStates(user, preferences, history, dispatch) {
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
  dispatch(validateAuth());
  dispatch(setChats(history));
}