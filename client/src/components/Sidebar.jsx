import '../styles/Sidebar.css';
import { useNavigate, useLocation } from 'react-router-dom';
import TerminalIcon from '../icons/terminal.svg?react';
import EditIcon from '../icons/edit.svg?react';
import AboutUsIcon from '../icons/about_us.svg?react';
import BuyWiseLogo from '../assets/BuyWiseLogo.png';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile } from '../libs/features/profileSlice';
import { selectIsAuthenticated, validateAuth } from '../libs/features/authenticationSlice'
import RedirectRoutes from '../middleware/middleware'

/**
 * This is the sidebar
 *
 * If the user logs out, it clears the token from browser and  the user from redux sture
 * */
export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isAuthenticated = useSelector(selectIsAuthenticated);  

  function handleNavigation(url) {
    RedirectRoutes(url, navigate, isAuthenticated)
  }

  function handleLogout() {
    localStorage.removeItem('token'); // TODO use cookies instead of local storage
    dispatch(validateAuth());
    dispatch(updateProfile({
      user: {},
      preferences: {}
    }));
    alert("You have successfully logged out!");
    window.location.reload();
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-items">
        <nav className="sidebar-nav">
          {/* Logo at the Top */}
          <div onClick={() => handleNavigation("/")} className="sidebar-logo" style={{ marginBottom: '1rem', cursor: 'pointer' }}>
            <img src={BuyWiseLogo} alt="BuyWise Logo" style={{ width: '180px', height: 'auto' }} />
          </div>
          <div onClick={() => handleNavigation('/chat')} className="sidebar-link">
            <TerminalIcon className="sidebar-icon" />
            <span className="sidebar-text">Chat</span>
          </div>
          <div onClick={() => handleNavigation('/profile')} className="sidebar-link">
            <EditIcon className="sidebar-icon" />
            <span className="sidebar-text">Profile</span>
          </div>
          <div onClick={() => handleNavigation('/about')} className="sidebar-link">
            <AboutUsIcon className="sidebar-icon" />
            <span className="sidebar-text">About Us</span>
          </div>
        </nav>

        {/* Auth Section at Bottom */}
        <div className="sidebar-auth">
          {!isAuthenticated ? (
            <button
              onClick={() => navigate('/login', { state: { from: location.pathname } })}
              className="auth-button"
            >
              Log In
            </button>
          ) : (
            <div className="sidebar-user-info">
              <div>
                Welcome Wise Buyer!
              </div>
              <button
                onClick={handleLogout}
                className="auth-button logout-button"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}