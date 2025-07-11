import '../styles/AuthPage.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const backendURL = import.meta.env.backendURL || 'http://localhost:3000';

export default function RegistrationPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  function handleCancel() {
    navigate('/login');
  };

  async function handleCreateAccount() {
    try {
      const response = await axios.post(
        `${backendURL}/api/auth/register`,
        { name, email, password }
      );
      
      if (response.data.success && response.data.token) {
        // Store the token in localStorage
        localStorage.setItem('token', response.data.token);
        alert(`Registration successful! Your account has been created and verified.`);
        navigate('/login');
      } else {
        alert('Registration failed: No token received');
      }
    } catch (error) {
      console.error(error);
      
      // Handle specific error cases gracefully
      if (error.response?.data?.error) {
        if (error.response.data.error.includes('Email already exists')) {
          alert('An account with this email already exists. Please try logging in instead.');
        } else {
          alert(error.response.data.error);
        }
      } else {
        alert('Registration failed. Please try again.');
      }
    }
  };

  return (
    <main className="login-container">
      <div className="login-scrollable">
        <div className="login-padding">
          <h1 className="login-header">Register</h1>
          <div className="login-section">
            <div className="login-field">
              <label className="login-field__label">Name:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter Name"
                className="login-field__input"
              />
            </div>
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
          <div className="auth-actions">  
            <button className="auth-button secondary" onClick={handleCancel}>Cancel</button>
            <button className="auth-button primary" onClick={handleCreateAccount}>Create Account</button>
          </div>
        </div>
      </div>
    </main>
  );
}

