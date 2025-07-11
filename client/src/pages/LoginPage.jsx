import '../styles/AuthPage.css';
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { updateProfile } from '../libs/features/profileSlice';
import { validateAuth } from '../libs/features/authenticationSlice';

const backendURL = import.meta.env.backendURL || 'http://localhost:3000';
const debug = false;

export default function LoginPage() {
  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // TODO better frontend modal
  async function handleLogin() {
    setLoading(true);

    try {
      const response = await axios.post(`${backendURL}/api/auth/login`, { 
        email: email,
        password: password
      });
      var userBody = response.data;
      (debug)? console.log("frontend body: " + JSON.stringify(userBody, null, 2)) : null;
    } catch (error) {
      (debug)? console.error("Login error:", error): null;
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
      alert(error.response?.data?.error || 'Error related to profile'); 
      setLoading(false);
      return;
    }

    const profile = profileBody.profile
    if (!profileBody.success || !profile) {
      alert('Login failed: Unable to fetch profile'); 
      setLoading(false);
      return;
    }

    saveToBrowser(userBody.token);
    saveState(userBody.user, profileBody.profile, dispatch)      
    navigate('/');
  }


  /**
   * Store the token in localStorage
   * 
   * TODO save using cookie
   */
  function saveToBrowser(token) {
    localStorage.setItem('token', token); 
  }

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
              />
            </div>
          </span>
          <div className="auth-actions">
            <button className="auth-button secondary" onClick={handleRegister}>Register</button>
            <button className="auth-button primary" onClick={handleLogin} disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}



/**
 * Save user to redux store for use around the app and validate authenticated state.
 */
function saveState(user, preferences, dispatch) {
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
}