import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import LoginPage from '../../pages/LoginPage';
import profileReducer from '../../libs/features/profileSlice';
import authenticationReducer from '../../libs/features/authenticationSlice';
import { vi } from 'vitest';
import axios from 'axios';
import '@testing-library/jest-dom/vitest';

vi.stubGlobal('alert', vi.fn());
vi.mock('axios');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});
vi.mock('../utils/browser', () => ({
  saveToBrowser: vi.fn(),
}));
vi.mock('../utils/states', () => ({
  saveStates: vi.fn(),
}));
vi.mock('localStorage', () => ({
  getItem: vi.fn().mockReturnValue('fakeToken'),
  setItem: vi.fn(),
  removeItem: vi.fn(),
}));

describe('Login Page', () => {
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

  describe('Visuals', () => {
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
    
    // TODO headers and inputs
  })  

  describe('Login functionality', () => {
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
    const mockProfileResponse = {
      data: {
        success: true,
        profile: {
          _id: 'userId',
          preferences: {},
        },
      },
    }
    const mockHistoryResponse = {
      data: {
        success: true,
        chats: [
          { _id: 'chat1', messages: [], createdAt: '2025-07-17' },
        ],
      },
    }

    let navigate;

    beforeEach(() => {
      navigate = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(navigate);

      axios.post
        .mockResolvedValueOnce(mockLoginResponse);
      axios.get
        .mockResolvedValueOnce(mockProfileResponse)
        .mockResolvedValueOnce(mockHistoryResponse);

      render(
        <Provider store={store}>
          <BrowserRouter>
            <LoginPage />
          </BrowserRouter>
        </Provider>
      );
    })

    afterEach(() => {
      vi.restoreAllMocks();
      cleanup();
    });

    it('should show spinner during loading', () => {            
      const loginButton = screen.getByTestId('login-button');
      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');

      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);

      expect(loginButton).toBeDisabled();
      const loadingSpinner = screen.getByLabelText(/Loading/i);
      expect(loadingSpinner).toBeInTheDocument();    
    })

    it('should call the auth, profile, and chat APIs', async () => {      
      const loginButton = screen.getByTestId('login-button');
      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');

      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);

      await waitFor(
        () => {
          expect(axios.post).toHaveBeenCalledTimes(1);
          expect(axios.post).toHaveBeenCalledWith(
            `${backendURL}/api/auth/login`,
            {
              email: 'john@example.com',
              password: 'password123',
            }
          );

          expect(axios.get).toHaveBeenCalledTimes(2);
          expect(axios.get).toHaveBeenCalledWith(
            `${backendURL}/api/profiles/userId`,
            {
              headers: {
                Authorization: `Bearer fakeToken`,
              },
            }
          );
          expect(axios.get).toHaveBeenCalledWith(
            `${backendURL}/api/chats?email=${encodeURIComponent('john@example.com')}`,
            {
              headers: {
                Authorization: `Bearer fakeToken`,
              },
            }
          );
        },
        { timeout: 3000 }
      );
    });

    it('should redirect the user to / after login', async () => {
      const loginButton = screen.getByTestId('login-button');
      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');

      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);

      await waitFor(
        () => {          
          expect(navigate).toHaveBeenCalledWith('/');
        },
        { timeout: 10000 }
      );
    })
  })  
});
