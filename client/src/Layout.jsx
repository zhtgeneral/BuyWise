import './styles/Layout.css';
import Sidebar from './components/Sidebar';
import { Outlet } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { validateAuth } from './libs/features/authenticationSlice';
import { useEffect } from 'react';

export default function Layout() {
  const dispatch = useDispatch();

  // Validate authentication state when the app loads
  useEffect(() => {
    dispatch(validateAuth());
  }, [dispatch]);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
}