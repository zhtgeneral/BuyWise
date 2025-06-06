import '../styles/Sidebar.css';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import TerminalIcon from '../icons/terminal.svg?react';
import EditIcon from '../icons/edit.svg?react';
import BuyWiseLogo from '../assets/BuyWiseLogo.png';

/** This is the sidebar */
export default function Sidebar() {
    const navigate = useNavigate();
    const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();

    return (
        <aside className="sidebar">
            {/* Navigation Section */}
            <nav className="sidebar-nav">
                {/* Logo at the Top */}
                <div onClick={() => navigate("/")} className="sidebar-logo" style={{ marginBottom: '2rem', cursor: 'pointer' }}>
                    <img src={BuyWiseLogo} alt="BuyWise Logo" style={{ width: '180px', height: 'auto' }} />
                </div>

                <div onClick={() => navigate('/chat')} className="sidebar-link">
                    <TerminalIcon className="sidebar-icon" />
                    <span className="sidebar-text">Chat</span>
                </div>
                <div onClick={() => navigate('/profile')} className="sidebar-link">
                    <EditIcon className="sidebar-icon" />
                    <span className="sidebar-text">Profile</span>
                </div>
            </nav>

            {/* Auth Section at Bottom */}
            <div className="sidebar-auth">
                {!isAuthenticated ? (
                    <button
                        onClick={() => loginWithRedirect()}
                        className="auth-button"
                    >
                        Log In
                    </button>
                ) : (
                    <div className="sidebar-user-info">
                        <img
                            src={user.picture}
                            alt={user.name}
                            className="user-avatar"
                        />
                        <div className="user-name">{user.name}</div>
                        <button
                            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                            className="auth-button logout-button"
                        >
                            Log Out
                        </button>
                    </div>
                )}
            </div>
        </aside>
    );
}