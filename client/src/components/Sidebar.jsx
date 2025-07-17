import '../styles/Sidebar.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchChatHistory, 
} from '../libs/features/historySlice';
import { selectIsAuthenticated, validateAuth } from '../libs/features/authenticationSlice';
import { clearChat } from '../libs/features/chatSlice';
import { clearProducts } from '../libs/features/productsSlice';
import { selectProfileUser } from '../libs/features/profileSlice';
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
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userEmail = useSelector(state => state.profile?.user?.email);

  const [canClearChat, setCanClearChat] = useState(false);
  const shouldRefreshRef = useRef(false);
  const hasLoadedHistoryRef = useRef(false);

  // Fetch chat history at authentication
  useEffect(() => {
    if (isAuthenticated && userEmail && !hasLoadedHistoryRef.current) {
      dispatch(fetchChatHistory(userEmail));
      hasLoadedHistoryRef.current = true;
    } else if (!isAuthenticated) {
      hasLoadedHistoryRef.current = false;
    }
  }, [isAuthenticated, userEmail, dispatch]);

  function handleLogout() {
    localStorage.removeItem('token'); // TODO use cookies instead of local storage
    dispatch(validateAuth());
    dispatch(updateProfile({
      user: {},
      preferences: {}
    }));
    alert("You have successfully logged out!");
    navigate('/');
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

  async function handleNavigation(url) {
    if (url !== '/chat') {
      setCanClearChat(false);
      RedirectRoutes(url, navigate, isAuthenticated);
      return;
    }

    // Check authentication before allowing access to chat
    if (!isAuthenticated) {
      RedirectRoutes('/chat', navigate, isAuthenticated);
      return;
    }

    // Navigate to new chat
    setCanClearChat(true);
    shouldRefreshRef.current = true;
  
    navigate('/chat', { replace: true }); // Not sure if this is a good idea, but can't think of better way to force create a new chat if user is engaged in active conversation
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
  return (
    <div className="sidebar-auth">
      {
        !isAuthenticated ? (
          <button
            onClick={() => navigate('/login', { state: { from: location.pathname } })}
            className="login-button"
          >
            Log In
          </button>
        ) : (
          <div className="sidebar-user-info">
            <div className='sidebar-user-name'>
              Welcome {displayName}!
            </div>
            <button
              onClick={handleLogout}
              className="logout-button"
            >
              Log Out
            </button>
          </div>
        )
      }
    </div>
  )
}