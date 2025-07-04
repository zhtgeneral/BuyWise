import '../styles/Sidebar.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChatHistory, selectChats, selectHistoryLoading, selectHistoryError, setActiveChatId, selectActiveChatId } from '../libs/features/historySlice';
import TerminalIcon from '../icons/terminal.svg?react';
import EditIcon from '../icons/edit.svg?react';
import AboutUsIcon from '../icons/about_us.svg?react';
import BuyWiseLogo from '../assets/BuyWiseLogo.png';
import { updateProfile } from '../libs/features/profileSlice';
import { selectIsAuthenticated, validateAuth } from '../libs/features/authenticationSlice';
import RedirectRoutes from '../middleware/middleware';
import PastChats from './PastChats';
import { clearChat } from '../libs/features/chatSlice';

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
  const chats = useSelector(selectChats);
  const loading = useSelector(selectHistoryLoading);
  const error = useSelector(selectHistoryError);
  const userEmail = useSelector(state => state.profile?.user?.email);
  const activeChatId = useSelector(selectActiveChatId); // Use Redux state instead of local state
  const [showNewChatTempEntry, setShowNewChatTempEntry] = useState(false);
  const shouldRefreshRef = useRef(false);
  const chat = useSelector(state => state.chat.messages);

  function handleChatSelect(chatId) {
    dispatch(setActiveChatId(chatId));
    if (!chatId) {
      setShowNewChatTempEntry(true);
      shouldRefreshRef.current = true;
    } else {
      setShowNewChatTempEntry(false);
    }
  }

  async function handleNavigation(url) {
    if (url === '/chat') {
      // If already on /chat and there is an active chat, save it
      if (location.pathname === '/chat' && chat && chat.length > 1) {
        const payload = { messages: chat, email: userEmail };
        try {
          await fetch("http://localhost:3000/api/chats", {
            method: "POST",
            body: JSON.stringify(payload),
            headers: { "Content-Type": "application/json" },
            keepalive: true
          });
          dispatch(clearChat());
          if (userEmail) {
            dispatch(fetchChatHistory(userEmail));
          }
        } catch (err) {
          console.error('Failed to save chat before starting new chat:', err);
        }
      }
      setShowNewChatTempEntry(true);
      dispatch(setActiveChatId(null));
      shouldRefreshRef.current = true;
    } else {
      setShowNewChatTempEntry(false);
    }
    RedirectRoutes(url, navigate, isAuthenticated);
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

  useEffect(() => {
    if (userEmail) {
      dispatch(fetchChatHistory(userEmail));
    }
  }, [location.pathname, dispatch, userEmail]);

  return (
    <aside className="sidebar">
      <div className="sidebar-items" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <nav className="sidebar-nav">
          {/* Logo at the Top */}
          <div onClick={() => handleNavigation("/")} className="sidebar-logo" style={{ marginBottom: '1rem', cursor: 'pointer' }}>
            <img src={BuyWiseLogo} alt="BuyWise Logo" style={{ width: '180px', height: 'auto' }} />
          </div>
          <div onClick={() => handleNavigation('/chat')} className="sidebar-link">
            <TerminalIcon className="sidebar-icon" />
            <span className="sidebar-text">New Chat</span>
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

        {/* Past Chats Section */}
        {isAuthenticated && (
          <PastChats 
            chats={chats} 
            loading={loading} 
            error={error} 
            showNewChatTempEntry={showNewChatTempEntry}
            onChatSelect={handleChatSelect}
            activeChatId={activeChatId}
          />
        )}

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