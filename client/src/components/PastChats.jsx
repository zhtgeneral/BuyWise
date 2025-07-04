import React from 'react';

export default function PastChats({ chats, loading, error }) {
  if (loading) return null;
  if ((!chats || chats.length === 0) && !error) {
    return null;
  }
  return (
    <div className="sidebar-past-chats" style={{ flex: 1, overflowY: 'auto', margin: '1rem 0' }}>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {chats && chats.length > 0 && (
        chats
          .slice()
          .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
          .map(chat => {
            const lastMsg = chat.messages && chat.messages.length > 0 ? chat.messages[chat.messages.length - 1] : null;
            return (
              <div key={chat._id} className="sidebar-chat-item" style={{ padding: '0.5rem', borderBottom: '1px solid #eee', cursor: 'pointer' }}>
                <div style={{ fontSize: '0.85rem', color: '#555' }}>{lastMsg ? lastMsg.text.slice(0, 50) : 'No messages'}...</div>
              </div>
            );
          })
      )}
    </div>
  );
}
