import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/LoginPage.css';

const backendURL = import.meta.env.backendURL || 'http://localhost:3000';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${backendURL}/api/auth/login`,
        { email, password }
      );
      
      if (response.data.success && response.data.token) {
        // Store the token in localStorage
        localStorage.setItem('token', response.data.token);
        alert(`Logging in with username: ${email}`);
        navigate('/');
      } else {
        alert('Login failed: No token received');
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Login Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
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

