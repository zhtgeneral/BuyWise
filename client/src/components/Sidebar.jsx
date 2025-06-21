import '../styles/Sidebar.css';
import { useNavigate, useLocation } from 'react-router-dom';
import TerminalIcon from '../icons/terminal.svg?react';
import EditIcon from '../icons/edit.svg?react';
import AboutUsIcon from '../icons/about_us.svg?react';
import BuyWiseLogo from '../assets/BuyWiseLogo.png';

/** This is the sidebar */
export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();  
    const isAuthenticated = true; //TO REMOVE
    const user = null; //TO REMOVE
    const isLoading = false; //TO REMOVE

    // Helper function to protect navigation and remember intended path
    const handleNavigation = (path) => {
        if (path === '/about' || path === "/") {
            navigate(path);
        } else if (!isAuthenticated) {
            navigate('/login', { state: { from: path } });
        } else {
            navigate(path);
        }
    };

    if (isLoading) {
        return (
            <aside className="sidebar" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div className="spinner"></div>
            </aside>
        );
    }

    return (
        <aside className="sidebar">
            <div className="sidebar-items">
                <nav className="sidebar-nav">
                    {/* Logo at the Top */}
                    <div onClick={() => handleNavigation("/")} className="sidebar-logo" style={{ marginBottom: '2rem', cursor: 'pointer' }}>
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
                            <img
                                src={user?.picture}
                                alt={user?.name}
                                className="user-avatar"
                            />
                            <div className="user-name">{user?.name}</div>
                            <button
                                onClick={() => {/* TO ADD LOGOUT LOGIC LATER */}}
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