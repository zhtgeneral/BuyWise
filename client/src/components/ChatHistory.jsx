import '../styles/PastChat.css';
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { 
  selectChats, 
  selectHistoryLoading,
  selectHistoryError,
  selectActiveChatId,
  setActiveChatId, 
} from '../libs/features/historySlice';
import { setConversationId, startNewConversation } from '../libs/features/chatSlice';

export default function PastChats({ 
  canClearChat, 
  setCanClearChat,
  dispatch,
  shouldRefreshRef
}) {
  const chats = useSelector(selectChats);
  const loading = useSelector(selectHistoryLoading);
  const errorMsg = useSelector(selectHistoryError);
  const activeChatId = useSelector(selectActiveChatId); 

  const activeChatRef = useRef(null);

  useEffect(() => {
    if (activeChatRef.current) {
      activeChatRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest' 
      });
    }
  }, [activeChatId]);

  function onChatSelect(chatId) {
    dispatch(setActiveChatId(chatId));
    if (!chatId) {
      // Starting new chat
      dispatch(startNewConversation());
      setCanClearChat(true);
      shouldRefreshRef.current = true;
    } else {
      // Selecting existing chat and set the conversationId for potential continuation
      dispatch(setConversationId(chatId));
      setCanClearChat(false);
    }
  }

  if (loading) return null;
  if ((!chats || chats.length === 0)) {
    return null;
  }

  const sortedChats = sortChatsByDate(chats);
  const isNewChatActive = canClearChat && !activeChatId;

  return (
    <div className="sidebar-past-chats">
      <div className="sidebar-chat-history-title">
        Chat history
      </div>

      <ConditionalErrorMsg 
        errorMsg={errorMsg}
      />

      <ActiveChatIndicator 
        isNewChatActive={isNewChatActive}
        canClearChat={canClearChat}
      />
      
      <PreviousChatLinks 
        sortedChats={sortedChats}
        activeChatId={activeChatId}
        onChatSelect={onChatSelect}
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

function ActiveChatIndicator({
  isNewChatActive, 
  canClearChat
}) {
  if (canClearChat) {
    return (
      <div className="sidebar-chat-item sidebar-chat-item-temp sidebar-chat-item-active">
        <div className={isNewChatActive ? 'active' : ''}>
          <div className="sidebar-chat-message">Current Chat</div>
        </div>
      </div>
    )
  }
}

function PreviousChatLinks({
  sortedChats,
  activeChatId,
  onChatSelect,
  activeChatRef
}) {
  return (
    <>
      {sortedChats.map(chat => {
        const lastMsg = chat.messages?.[chat.messages.length - 1] || null;
        const isActive = activeChatId === chat._id;

        return (
          <Link
            to={`/chat/${chat._id}`}
            key={chat._id}
            onClick={() => onChatSelect && onChatSelect(chat._id)}
          >
            <div
              ref={isActive ? activeChatRef : null}
              className={`sidebar-chat-message${isActive ? ' active' : ''}`}
            >
              {lastMsg ? lastMsg.text.slice(0, 70) : 'No messages'}...
            </div>
          </Link>
        );
      })}
    </>
  );
}