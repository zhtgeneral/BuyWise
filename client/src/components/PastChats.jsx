import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

export default function PastChats({ chats, loading, error, showNewChatTempEntry, onChatSelect, activeChatId }) {
  const activeChatRef = useRef(null);

  useEffect(() => {
    if (activeChatRef.current) {
      activeChatRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeChatId]);

  if (loading) return null;
  if ((!chats || chats.length === 0) && !error && !showNewChatTempEntry) {
    return null;
  }
  
  // Check if we're in a "new chat" state (no active chat ID and on /chat route)
  const isNewChatActive = showNewChatTempEntry && !activeChatId;
  
  return (
    <div className="sidebar-past-chats" style={{ flex: 1, overflowY: 'auto', margin: '1rem 0' }}>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {showNewChatTempEntry && (
        <Link
          to="/chat"
          style={{ textDecoration: 'none' }}
          onClick={() => onChatSelect && onChatSelect(null)}
        >
          <div 
            className={`sidebar-chat-item sidebar-chat-item-temp${isNewChatActive ? ' active' : ''}`} 
            style={{ 
              padding: '0.5rem', 
              borderBottom: '1px solid #eee', 
              background: isNewChatActive ? '#e0e7ff' : '#f5f5f5', 
              fontStyle: 'italic', 
              color: '#888',
              cursor: 'pointer'
            }}
          >
            <div style={{ fontSize: '0.85rem' }}>Most Recent Conversation</div>
          </div>
        </Link>
      )}
      {chats && chats.length > 0 && (
        chats
          .slice()
          .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
          .map(chat => {
            const lastMsg = chat.messages && chat.messages.length > 0 ? chat.messages[chat.messages.length - 1] : null;
            const isActive = activeChatId === chat._id;
            return (
              <Link
                to={`/chat/${chat._id}`}
                key={chat._id}
                style={{ textDecoration: 'none' }}
                onClick={() => onChatSelect && onChatSelect(chat._id)}
              >
                <div
                  ref={isActive ? activeChatRef : null}
                  className={`sidebar-chat-item${isActive ? ' active' : ''}`}
                  style={{ padding: '0.5rem', borderBottom: '1px solid #eee', cursor: 'pointer', background: isActive ? '#e0e7ff' : undefined }}
                >
                  <div style={{ fontSize: '0.85rem', color: '#555' }}>{lastMsg ? lastMsg.text.slice(0, 50) : 'No messages'}...</div>
                </div>
              </Link>
            );
          })
      )}
    </div>
  );
}
