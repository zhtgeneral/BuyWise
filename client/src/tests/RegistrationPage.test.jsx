import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest';
import axios from 'axios';
import RegistrationPage from '../pages/RegistrationPage';
import profileReducer from '../libs/features/profileSlice';
import authenticationReducer from '../libs/features/authenticationSlice';
import '@testing-library/jest-dom/vitest';

vi.mock('axios');
global.alert = vi.fn();

describe('RegistrationPage Tests', () => {
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
    cleanup()
  });

  it('should show error when password is too short', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <RegistrationPage />
        </BrowserRouter>
      </Provider>
    );

    const nameInput = screen.getByTestId('email-input');
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');

    fireEvent.change(nameInput, { target: { value: 'John Smith' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: '12' } });

    const registerButton = screen.getByTestId('register-button');
    fireEvent.click(registerButton);
    
    await waitFor(() => expect(global.alert).toHaveBeenCalledWith('Password must be at least 8 characters'));
  });

  it('should show loading spinner when submitting', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <RegistrationPage />
        </BrowserRouter>
      </Provider>
    );

    axios.post.mockResolvedValueOnce({
      data: { success: true, token: 'mocked_token' },
    });

    fireEvent.change(screen.getByPlaceholderText('Enter Name'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByPlaceholderText('Enter Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Enter Password'), { target: { value: 'validpassword' } });

    const registerButton = screen.getByTestId('register-button');
    fireEvent.click(registerButton);

    const loadingSpinner = screen.getByLabelText(/Loading/i);
    expect(loadingSpinner).toBeInTheDocument();

    await new Promise(resolve => setTimeout(resolve, 3000));

    await waitFor(() => expect(global.alert).toHaveBeenCalledWith('Registration successful! Your account has been created and verified.'));
  });
});
