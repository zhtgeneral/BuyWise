import '../styles/Sidebar.css';
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';

import { selectIsAuthenticated, validateAuth } from '../libs/features/authenticationSlice';
import { selectProfileUser } from '../libs/features/profileSlice';
import { clearChat } from '../libs/features/chatSlice';
import { clearChats, selectChats } from '../libs/features/historySlice';
import { clearProducts } from '../libs/features/productsSlice';
import { setChats } from '../libs/features/historySlice';
import { updateProfile } from '../libs/features/profileSlice';

import PastChats from './ChatHistory';
import Browser from '../utils/browser';
import RedirectRoutes from '../middleware/middleware';

import TerminalIcon from '../icons/terminal.svg?react';
import EditIcon from '../icons/edit.svg?react';
import AboutUsIcon from '../icons/about_us.svg?react';
import ExploreIcon from '../icons/compass.svg?react';
import BuyWiseLogo from '../assets/BuyWiseLogo.png';

const backendURL = import.meta.env.BACKEND_URL || 'http://localhost:3000';

/**
 * This is the sidebar
 *
 * If the user logs out, it clears the token from browser and the user from redux sture
 * */
export default function Sidebar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectProfileUser);
  const chatHistory = useSelector(selectChats);

  const isAuthenticated = useSelector(selectIsAuthenticated);
  
  /**
   * Chat history is fetched at login for a unified experience, but reloading the page may clear the history.
   */
  React.useEffect(() => {
    async function ensureChatHistory() {
      if (isAuthenticated && chatHistory.length === 0) {
        try {
          const response = await axios.get(`${backendURL}/api/chats?email=${encodeURIComponent(user.email)}`,
          {
            headers: {
              'Authorization': `Bearer ${Browser.getToken()}`
            }
          });
          var historyBody = response.data;
        } catch (error) {
          alert(error.response?.data?.error || 'Error related to fetching chat history'); 
          return;
        }

        if (!historyBody.success) {
          alert('Login Failed: Unable to fetch chat history'); 
          return;
        }
        dispatch(setChats(historyBody.chats));
      }
    }

    ensureChatHistory();
  }, [isAuthenticated, chatHistory])

  function handleLogout() {
    Browser.logout();
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
          dispatch={dispatch}
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
  dispatch,
}) {
  const location = useLocation();

  async function handleNavigation(url) {
    if (url === '/chat' && location.pathname.startsWith('/chat')) {
      dispatch(clearChat());
      dispatch(clearProducts());
      navigate('/chat');
      return;
    }
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