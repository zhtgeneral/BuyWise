import '../styles/LoginPage.css';
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

  async function handleLogin() {
    setLoading(true);

    try {
      const response = await axios.post(`${backendURL}/api/auth/login`, { 
        email: email,
        password: password
      });

      const body = response.data;
      (debug)? console.log("frontend body: " + JSON.stringify(body, null, 2)) : null;

      if (!body.success || !body.token) {
        alert('Login failed: No token received'); // TODO better frontend modal
        return;
      }
  
      saveToBrowser(body.token);
      saveState(body.user);
      navigate('/');
    } catch (error) {
      (debug)? console.error("Login error:", error): null;
      alert(error.response?.data?.error || 'Login Failed'); // TODO better frontend modal
    } finally {
      setLoading(false);
    }
  }

  /**
   * Save user to redux store for use around the app and validate authenticated state.
   */
  function saveState(user) {
    const updatedProfile = {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified
      },          
      preferences: {}
      // preferences are fetched later on
    }
    dispatch(updateProfile(updatedProfile)); 
    dispatch(validateAuth());
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
          <div className="login-section">
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
          </div>
          <div className="login-actions">
            <button className="login-button edit" onClick={handleLogin} disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
            <button className="login-button edit" onClick={handleRegister}>Register</button>
          </div>
        </div>
      </div>
    </main>
  );
}

