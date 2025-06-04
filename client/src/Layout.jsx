import './styles/Layout.css';
import Sidebar from './components/Sidebar';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  const user = 1;

  if (!user) {
    return <div>LOGIN SCREEN TODO</div>;
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
}