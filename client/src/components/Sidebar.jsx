import '../styles/Sidebar.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import TerminalIcon from '../icons/terminal.svg?react';
import EditIcon from '../icons/edit.svg?react';
import AboutUsIcon from '../icons/about_us.svg?react';
import BuyWiseLogo from '../assets/BuyWiseLogo.png';

/** This is the sidebar */
export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

    useEffect(() => {
        const handleStorageChange = () => {
            setIsAuthenticated(!!localStorage.getItem("token"));
        };
        window.addEventListener("storage", handleStorageChange);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);
    

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

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
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