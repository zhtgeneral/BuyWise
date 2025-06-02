import './Layout.css'
import { Outlet } from 'react-router-dom';

/**
 * This component sets the layout for the app.
 * 
 * Add components here for sidebars, navbars, footers ect.
 * 
 * Outlet is the main content.
 */
export default function Layout() {
  return (
    <main>
      <Outlet />
    </main>
  )
}