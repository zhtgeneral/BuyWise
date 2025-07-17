import '../styles/PastChat.css';
import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { 
  selectChats, 
  selectHistoryLoading,
  selectHistoryError,
} from '../libs/features/historySlice';

export default function PastChats({ 
  // canClearChat, 
  setCanClearChat,
  dispatch,
  shouldRefreshRef
}) {
  const chats = useSelector(selectChats);
  const loading = useSelector(selectHistoryLoading);
  const errorMsg = useSelector(selectHistoryError);
  const location = useLocation();

  // Get current chat ID from URL path
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

  if (loading) return null;
  if ((!chats || chats.length === 0)) {
    return null;
  }

  const sortedChats = sortChatsByDate(chats);
  // const isNewChatActive = canClearChat && !activeChatId;

  return (
    <div className="sidebar-past-chats">
      <div className="sidebar-chat-history-title">
        Chat history
      </div>

      <ConditionalErrorMsg 
        errorMsg={errorMsg}
      />
      
      <PreviousChatLinks 
        sortedChats={sortedChats}
        currentChatId={currentChatId}
        activeChatRef={activeChatRef}
      />
    </div>
  );
}


function sortChatsByDate(chats) {
  if (!chats || chats.length === 0) return [];
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
  return (
    <>
      {sortedChats.map(chat => {
        const lastMsg = chat.messages?.[chat.messages.length - 1] || null;
        const isActive = currentChatId === chat._id;

        return (
          <Link
            to={`/chat/${chat._id}`}
            key={chat._id}
          >
            <div
              ref={isActive ? activeChatRef : null}
              className={`sidebar-chat-message${isActive ? ' active' : ''}`}
            >
              {lastMsg ? lastMsg.text.slice(0, 70) + '...' : 'No messages'}
            </div>
          </Link>
        );
      })}
    </>
  );
}