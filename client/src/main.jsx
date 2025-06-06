import './styles/main.css';
import { Provider } from 'react-redux';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import { store } from './libs/store';

import { Auth0Provider } from '@auth0/auth0-react'; 

import Layout from './Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import ChatPage from './pages/ChatPage';

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
    ]
  }
]);


const domain = 'dev-rzymgcdpizdpp3pt.us.auth0.com';       
const clientId = 'xefmkcSCmwyxqpY8Vc0M0RGipUfJlmKC';  

/**
 * This file provides the app with hooks.
 *
 * `<Provider store={store}>` provides the app with `useSelector` and `useDispatch` hooks.
 *
 * `useSelector` gets the displayed value of a state.
 * `useDispatch` triggers an event to impact the state.
 *
 * ` <RouterProvider router={router} />` provides the app with routes
 */
createRoot(document.getElementById('root')).render(
    <Auth0Provider
        domain={domain}
        clientId={clientId}
        authorizationParams={{
          redirect_uri: window.location.origin,
        }}
    >
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    </Auth0Provider>
);