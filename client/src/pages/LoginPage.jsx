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
      <div className="login-title">
        Login
      </div>
      <label htmlFor="username">Username</label>
      <input
        id="username"
        type="text"
        value={username}
        onChange={e => setUsername(e.target.value)}
        placeholder="Enter Username"
      />
      <label htmlFor="Password">Password</label>
      <input
        id="password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Enter Password"
      />

      <button onClick={handleLogin}>Login</button>
      <button onClick={handleRegister}>Register</button>
    </main>
  );
}

