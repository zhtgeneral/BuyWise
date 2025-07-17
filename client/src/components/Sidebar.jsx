import '../styles/Sidebar.css';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsAuthenticated, validateAuth } from '../libs/features/authenticationSlice';
import { selectProfileUser } from '../libs/features/profileSlice';
import { clearChats } from '../libs/features/historySlice';
import PastChats from './ChatHistory';

import TerminalIcon from '../icons/terminal.svg?react';
import EditIcon from '../icons/edit.svg?react';
import AboutUsIcon from '../icons/about_us.svg?react';
import ExploreIcon from '../icons/compass.svg?react';
import BuyWiseLogo from '../assets/BuyWiseLogo.png';
import { updateProfile } from '../libs/features/profileSlice';
import RedirectRoutes from '../middleware/middleware';

/**
 * This is the sidebar
 *
 * If the user logs out, it clears the token from browser and the user from redux sture
 * */
export default function Sidebar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isAuthenticated = useSelector(selectIsAuthenticated);

  function handleLogout() {
    localStorage.removeItem('token'); // TODO use cookies instead of local storage
    dispatch(validateAuth());
    dispatch(updateProfile({
      user: {},
      preferences: {}
    }));
    dispatch(clearChats());
    alert("You have successfully logged out!");
    navigate('/');
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-items" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <LogoAndRoutes 
          isAuthenticated={isAuthenticated}
          navigate={navigate}        
        />

        {
          isAuthenticated && <PastChats />
        }
        
        <AuthSection 
          isAuthenticated={isAuthenticated}
          navigate={navigate}
          handleLogout={handleLogout}
        />
      </div>
    </aside>
  );
}

function LogoAndRoutes({
  isAuthenticated,
  navigate,
}) {
  async function handleNavigation(url) {
    RedirectRoutes(url, navigate, isAuthenticated);
  }

  function activeClassName(target) {
    return (location.pathname === target)? 'sidebar-link active': 'sidebar-link'    
  }

  return (
    <nav className="sidebar-nav">
      <div onClick={() => handleNavigation("/")} className="sidebar-logo" style={{ marginBottom: '1rem', cursor: 'pointer' }}>
        <img src={BuyWiseLogo} alt="BuyWise Logo" style={{ width: '180px', height: 'auto' }} />
      </div>
      <span className='sidebar-separator'>
        <div onClick={() => handleNavigation('/chat')} className={activeClassName('/chat')}>
          <TerminalIcon className="sidebar-icon" />
          <span className="sidebar-text">Create new chat</span>
        </div>
        <div onClick={() => handleNavigation('/profile')} className={activeClassName('/profile')}>
          <EditIcon className="sidebar-icon" />
          <span className="sidebar-text">Edit Profile</span>
        </div>
        <div onClick={() => handleNavigation('/explore-products')} className={activeClassName('/explore')}>
          <ExploreIcon className="sidebar-icon" />
          <span className="sidebar-text">Explore Products</span>
        </div>
        <div onClick={() => handleNavigation('/about')} className={activeClassName('/about')}>
          <AboutUsIcon className="sidebar-icon" />
          <span className="sidebar-text">About Us</span>
        </div>
      </span>
    </nav>
  )
}

function AuthSection({
  isAuthenticated,
  navigate,
  handleLogout
}) {
  const { name } = useSelector(selectProfileUser);
  const displayName = name? name : 'Wise Buyer';

  function navigateToLogin() {
    navigate('/login', { state: { from: location.pathname } })
  }
  
  return (
    <div className="sidebar-auth">
      {
        !isAuthenticated 
        ? <button className="login-button" onClick={navigateToLogin} >Log In</button>
        : <div className="sidebar-user-info">
            <div className='sidebar-user-name'>Welcome {displayName}!</div>
            <button className="logout-button" onClick={handleLogout}>Log Out</button>
          </div>        
      }
    </div>
  )
}