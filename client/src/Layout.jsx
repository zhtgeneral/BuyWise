import './styles/Layout.css';
import Sidebar from './components/Sidebar';
import { Outlet } from 'react-router-dom';
import LoadUserFromAuthToRedux from './libs/loadUserToRedux'

export default function Layout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Outlet />
      </div>
      <LoadUserFromAuthToRedux />
    </div>
  );
}