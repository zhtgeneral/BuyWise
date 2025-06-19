import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/LoginPage.css';
const backendURL = import.meta.env.backendURL || 'http://localhost:3000';

export default function RegistrationPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const navigate = useNavigate();

  const handleCancel = () => {
    navigate('/login');
  };

  const handleCreateAccount = async () => {
    try {
      await axios.post(
        `${backendURL}/api/profiles`,
        { name, email, password }
      );
      alert(`Verification Email sent to: ${email}`);
      navigate('/login');
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || 'Registration Failed');
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
          <div className="login-actions">  
            <button className="login-button edit" onClick={handleCancel}>Cancel</button>
            <button className="login-button edit" onClick={handleCreateAccount}>Create Account</button>
          </div>
        </div>
      </div>
    </main>
  );
}

