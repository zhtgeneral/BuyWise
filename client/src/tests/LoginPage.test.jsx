import React from 'react';
import { render, screen, fireEvent, waitFor, act, cleanup } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import profileReducer from '../libs/features/profileSlice';
import authenticationReducer from '../libs/features/authenticationSlice';
import { vi } from 'vitest';
import axios from 'axios';
import '@testing-library/jest-dom/vitest';

// Mock axios and alert
vi.mock('axios');
global.alert = vi.fn(); // Mock window.alert

describe('LoginPage Button Tests', () => {
  const backendURL = import.meta.env.backendURL || 'http://localhost:3000';
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        profile: profileReducer,
        authentication: authenticationReducer,
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  it('should render the login button with correct text and attributes', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </Provider>
    );

    const loginButton = screen.getByRole('button', { name: /Login/i });

    expect(loginButton).toBeInTheDocument();
    expect(loginButton).toHaveTextContent('Login');
    expect(loginButton).toHaveClass('primary');
    expect(loginButton).not.toBeDisabled();
  });

  it('should show loading spinner when login clicked', async () => {
    const mockLoginResponse = {
      data: {
        success: true,
        token: 'fakeToken',
        user: {
          _id: 'userId',
          name: 'John Doe',
          email: 'john@example.com',
        },
      },
    };

    axios.post.mockResolvedValueOnce(mockLoginResponse);

    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        profile: {
          _id: 'userId',
          preferences: {},
        },
      },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </Provider>
    );

    const loginButton = screen.getByTestId('login-button');
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');

    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    expect(loginButton).toBeDisabled();
    const loadingSpinner = screen.getByLabelText(/Loading/i);
    expect(loadingSpinner).toBeInTheDocument();

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    expect(axios.post).toHaveBeenCalledWith(`${backendURL}/api/auth/login`, {
      email: 'john@example.com',
      password: 'password123',
    });

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));
  });
});
