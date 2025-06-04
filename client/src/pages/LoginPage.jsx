import { useState } from 'react';
import '../styles/LoginPage.css';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // TODO: login logic + security after M1
    alert(`Logging in with username: ${username}`);
  };

  const handleRegister = () => {
    alert("TEST");
  }

  return (
    <main className="login-container">
      <div className="login-scrollable">
        <div className="login-padding">
          <h1 className="login-header">Login</h1>

          <div className="login-section">
            <div className="login-field">
              <label className="login-field__label">Username:</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter Username"
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
            <button className="login-button edit" onClick={handleLogin}>Login</button>
            <button className="login-button edit" onClick={handleRegister}>Register</button>
          </div>
        </div>
      </div>
    </main>
  );
}

