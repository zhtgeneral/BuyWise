import '@mantine/core/styles.css';
import './styles/main.css';
import { Provider } from 'react-redux';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import { store } from './libs/store';
import { MantineProvider } from '@mantine/core';

import { Auth0ProviderWithHistory } from './Auth0ProviderWithHistory'; 

import Layout from './Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import ChatPage from './pages/ChatPage';
import VerificationPage from './pages/VerificationPage';
import AboutPage from './pages/AboutPage';

/**
 * This defines the routes in our app.
 */
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    // TODO
    // errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: 'chat',
        element: <ChatPage />
      },
      {
        path: 'login',
        element: <LoginPage />
      },
      {
        path: 'profile',
        element: <ProfilePage />
      },
      {
        path: 'verify-email',
        element: <VerificationPage />
      },
      {
        path: 'about',
        element: <AboutPage />
      },
    ]
  }
]);

/**
 * This file provides the app with hooks.
 *
 * `<Provider store={store}>` provides the app with `useSelector` and `useDispatch` hooks.
 *
 * `useSelector` gets the displayed value of a state.
 * `useDispatch` triggers an event to impact the state.
 *
 * `<RouterProvider router={router} />` provides the app with routes.
 */
createRoot(document.getElementById('root')).render(
  <Auth0ProviderWithHistory>
    <Provider store={store}>
      <MantineProvider withGlobalStyles withNormalizeCSS>
        <RouterProvider router={router} />
      </MantineProvider>
    </Provider>
  </Auth0ProviderWithHistory>
);