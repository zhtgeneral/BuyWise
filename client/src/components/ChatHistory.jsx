import '../styles/PastChat.css';
import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { 
  selectChats, 
  selectHistoryError,
} from '../libs/features/historySlice';

export default function PastChats() {
  const chats = useSelector(selectChats) || [];
  const errorMsg = useSelector(selectHistoryError) || '';
  const location = useLocation();

  // Get current chat ID from URL path
  // TODO use redux store for current chatId
  const currentChatId = location.pathname.startsWith('/chat/') 
    ? location.pathname.split('/')[2] 
    : null;

  const activeChatRef = useRef(null);

  useEffect(() => {
    if (activeChatRef.current) {
      activeChatRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest' 
      });
    }
  }, [currentChatId]);
  
  const sortedChats = sortChatsByDate(chats);  
 
  if (chats.length > 0) {
    return (
      <div className="sidebar-past-chats">
        <div className="sidebar-chat-history-title">Chat history</div>
        <ConditionalErrorMsg errorMsg={errorMsg}/>        
        <PreviousChatLinks 
          sortedChats={sortedChats}
          currentChatId={currentChatId}
          activeChatRef={activeChatRef}
        />
      </div>
    );
  }
  
}


function sortChatsByDate(chats) {
  if (chats.length === 0) return [];
  return chats
    .slice()
    .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
}

function ConditionalErrorMsg({
  errorMsg
}) {
  if (errorMsg) {
    return <div className="sidebar-error">An error occured: {errorMsg}</div>
  }
}

function PreviousChatLinks({
  sortedChats,
  currentChatId,
  activeChatRef
}) {
  function formatMessage(msg) {
    return msg ? msg.text.slice(0, 70) + '...' : 'No messages';
  }
  function conditionalClassName(isActive) {
    return `sidebar-chat-message${isActive ? ' active' : ''}`;
  }

  return (
    <>
      {sortedChats.map(chat => {
        const id = chat._id;
        const lastMsg = chat.messages?.[chat.messages.length - 1] || null;
        const isActive = currentChatId === chat._id;

        return (
          <Link to={`/chat/${id}`} key={id}>
            <div ref={isActive ? activeChatRef : null} className={conditionalClassName(isActive)}>
              {formatMessage(lastMsg)}
            </div>
          </Link>
        );
      })}
    </>
  );
}