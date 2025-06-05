import '../styles/Sidebar.css'
import { useNavigate } from 'react-router-dom'
import TerminalIcon from '../icons/terminal.svg?react'
import EditIcon from '../icons/edit.svg?react'

/** This is the sidebar */
export default function Sidebar() {
  const navigate = useNavigate();
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <div onClick={() => navigate("/")} className="sidebar-link">
          BuyWise
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
    </aside>
  )
}