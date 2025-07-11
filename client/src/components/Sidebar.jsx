import '../styles/Sidebar.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchChatHistory, 
  setActiveChatId, 
} from '../libs/features/historySlice';
import { selectIsAuthenticated, validateAuth } from '../libs/features/authenticationSlice';
import { clearChat } from '../libs/features/chatSlice';
import { clearProducts } from '../libs/features/productsSlice';
import { selectProfileUser } from '../libs/features/profileSlice';
import PastChats from './PastChats';

import TerminalIcon from '../icons/terminal.svg?react';
import EditIcon from '../icons/edit.svg?react';
import AboutUsIcon from '../icons/about_us.svg?react';
import BuyWiseLogo from '../assets/BuyWiseLogo.png';
import { updateProfile } from '../libs/features/profileSlice';
import RedirectRoutes from '../middleware/middleware';

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
  const userEmail = useSelector(state => state.profile?.user?.email);

  const [canClearChat, setCanClearChat] = useState(false);
  const shouldRefreshRef = useRef(false);

  useEffect(() => {
    if (userEmail) {
      dispatch(fetchChatHistory(userEmail));
    }
  }, [location.pathname, dispatch, userEmail]);

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
      <div className="sidebar-items" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <LogoAndRoutes 
          isAuthenticated={isAuthenticated}
          navigate={navigate}
          setCanClearChat={setCanClearChat}
          userEmail={userEmail}
          dispatch={dispatch}
          shouldRefreshRef={shouldRefreshRef}
        />

        {isAuthenticated && (
          <PastChats 
            canClearChat={canClearChat}
            setCanClearChat={setCanClearChat}
            dispatch={dispatch}
            shouldRefreshRef={shouldRefreshRef}
          />
        )}
        
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
  setCanClearChat,
  userEmail,
  dispatch,
  shouldRefreshRef
}) {
  const chat = useSelector(state => state.chat.messages);

  async function handleNavigation(url) {
    if (url !== '/chat') {
      setCanClearChat(false);
      RedirectRoutes(url, navigate, isAuthenticated);
      return;
    }

    // If already on /chat and there is an active chat, save it
    if (location.pathname === '/chat' && chat && chat.length >= 1) {
      const payload = { 
        messages: chat, 
        email: userEmail 
      };
      try {
        await fetch("http://localhost:3000/api/chats", {
          method: "POST",
          body: JSON.stringify(payload),
          headers: { "Content-Type": "application/json" },
          keepalive: true
        });

        dispatch(clearProducts());
        dispatch(clearChat());
        userEmail? dispatch(fetchChatHistory(userEmail)): null;
      } catch (err) {
        console.error('Sidebar: Failed to save chat before starting new chat:', err);
      }
    }

    setCanClearChat(true);
    dispatch(setActiveChatId(null));
    
    shouldRefreshRef.current = true;
  
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
          <span className="sidebar-text">Profile</span>
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
  return (
    <div className="sidebar-auth">
      {
        !isAuthenticated ? (
          <button
            onClick={() => navigate('/login', { state: { from: location.pathname } })}
            className="auth-button login-button"
          >
            Log In
          </button>
        ) : (
          <div className="sidebar-user-info">
            <div>
              Welcome {displayName}!
            </div>
            <button
              onClick={handleLogout}
              className="auth-button logout-button"
            >
              Log Out
            </button>
          </div>
        )
      }
    </div>
  )
}