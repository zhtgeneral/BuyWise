import '@mantine/core/styles.css';
import './styles/main.css';
import { Provider } from 'react-redux';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';
import { createRoot } from 'react-dom/client';
import { store, persistor } from './libs/store';
import { MantineProvider } from '@mantine/core';
import Layout from './Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import ChatPage from './pages/ChatPage';
import VerificationPage from './pages/VerificationPage';
import AboutPage from './pages/AboutPage';
import RegistrationPage from './pages/RegistrationPage';
import ExplorePage from './pages/ExplorePage'

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
        path: 'chat/:chatId',
        element: <ChatPage />
      },
      {
        path: 'login',
        element: <LoginPage />
      },
      {
        path: 'registration',
        element: <RegistrationPage />
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
      {
        path: 'explore-products',
        element: <ExplorePage />
      }
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
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <MantineProvider withGlobalStyles withNormalizeCSS>
        <RouterProvider router={router} />
      </MantineProvider>
    </PersistGate>
  </Provider>
);