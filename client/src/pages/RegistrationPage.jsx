import React from 'react';
import '../styles/AuthPage.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import { OrbitProgress } from 'react-loading-indicators'
import Browser from '../utils/browser';

const backendURL = import.meta.env.backendURL || 'http://localhost:3000';

export default function RegistrationPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function handleCancel() {
    navigate('/login');
  };

  async function handleCreateAccount() {
    if (password.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));  // TODO only for test

    try {
      var response = await axios.post(`${backendURL}/api/auth/register`,
        { 
          name: name, 
          email: email, 
          password: password
        }
      );
    } catch (error) {
      console.error('Register Page: ' + error);
      if (error.response?.data?.error) {
        alert(error.response.data.error);        
      } else {
        alert('Registration failed. Please try again.');
      }
      setIsLoading(false);
      return;
    }

    const { success, token } = response.data;
    if (success && token) {        
      Browser.saveToken(token);
      setIsLoading(false);
      navigate('/login');
      alert(`Registration successful! Your account has been created and verified.`);
      return;
    } 

    alert('Registration failed: No token received');
    setIsLoading(false);      
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
                data-testid="name-input"
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
          </div>
          <div className="auth-actions">  
            <button className="auth-button secondary" onClick={handleCancel}>Cancel</button>
            <button className="auth-button primary" onClick={handleCreateAccount} data-testid="register-button">
              <ConditionalLoadingIndicator isLoading={isLoading}/>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
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
  return 'Register';
}