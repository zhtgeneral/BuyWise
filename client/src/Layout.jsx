import './styles/Layout.css';
import Sidebar from './components/Sidebar';
import { Outlet } from 'react-router-dom';
import StateDebugger from './debug/StateDebugger';

export default function Layout() {

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Outlet />
      </div>
      <StateDebugger active={false} />
    </div>
  );
}