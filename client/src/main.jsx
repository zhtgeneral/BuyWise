import './styles/main.css';
import { Provider } from 'react-redux';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import { store } from './libs/store'

import Layout from './Layout';
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';



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

/**
 * This file provides the app with hooks.
 * 
 * `<Provider store={store}>` provides the app with `useSelector` and `useDispatch` hooks.
 * 
 * `useSelector` gets the displayed value of a state.
 * `useDispatch` triggers an event to impact the state.
 * 
 * Don't forget to insert the slice's action into `useDispatch`. 
 * 
 * ` <RouterProvider router={router} />` provides the app with routes
 */
createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>
);