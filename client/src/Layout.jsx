import Sidebar from './components/Sidebar';
import './styles/Layout.css'
import { Outlet } from 'react-router-dom';

/**
 * This component sets the layout for the app.
 * 
 * Add components here for sidebars, navbars, footers ect.
 * 
 * Outlet is the main content.
 */
export default function Layout() {
  const user = 1;

  /** Render the login screen */
  if (!user) {
    return (
      <>
        LOGIN SCREEN TODO
      </>
    )
  }
  /** Otherwise render the app with the sidebar */
  return (
    <main>
      <Sidebar/>
      <Outlet />
    </main>
  )
}