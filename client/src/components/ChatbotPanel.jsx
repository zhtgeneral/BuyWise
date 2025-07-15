import '../styles/ChatbotPanel.css';
import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';

import ChatMessage from './ChatMessage';
import { 
  addMessage, 
  selectChatMessages, 
  selectConversationId, 
  setConversationId 
} from '../libs/features/chatSlice';
import { setProducts } from '../libs/features/productsSlice';

export default function ChatbotPanel({
  messages,
  setShowProduct,
}) {
  const dispatch = useDispatch();
  const reduxChat = useSelector(selectChatMessages);
  const conversationId = useSelector(selectConversationId);
  const location = useLocation();

  const chat = messages ?? reduxChat;
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  async function handleSendMessage() {
    if (!userInput.trim()) return;
    
    const newUserMessage = { 
      speaker: "user", 
      text: userInput 
    };

    dispatch(addMessage(newUserMessage));
    setUserInput("");

    setIsLoading(true);
    try {
      var response = await axios.post('http://localhost:3000/api/chatbot', {
        message: userInput,
        conversationId: conversationId, // Send current conversationId for incremental saving
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });      
    } catch (error) {
      console.error('ChatbotPanel error:', error);
      dispatch(addMessage({ 
        speaker: "bot", 
        text: "Sorry, I encountered an error. Please try again later."
      }));
      setIsLoading(false);
      return;
    } 

    if (response.status === 200) {
      const { 
        chatbotMessage, 
        productData, 
        responseConversationId 
      } = response.data;
      
      // Update conversationId in Redux if we got one back
      if (responseConversationId && responseConversationId !== conversationId) {
        dispatch(setConversationId(responseConversationId));
      }
      
      if (productData?.length > 0) {
        dispatch(addMessage({
          speaker: "bot", 
          text: chatbotMessage,
          recommendedProducts: productData
        }));
        dispatch(setProducts(productData));
        setShowProduct(true);
      } else {
        dispatch(addMessage({
          speaker: "bot", 
          text: chatbotMessage     
        }));
      }
    } else {
      dispatch(addMessage({ 
        speaker: "bot", 
        text: "My output is displaying incorrectly, but my internals are working. Sorry for the inconvenience."
      }));
    }    
    setIsLoading(false);
  };

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const isPastChat = /^\/chat\/.+/.test(location.pathname) && location.pathname !== '/chat';

  return (
    <>
      <ScrollChatToBottom messagesEndRef={messagesEndRef} chat={chat} />
      <AutoResizeTextArea textareaRef={textareaRef} userInput={userInput} />

      <div className="chatbot-panel-container">      
        <h1>
          Talk to <span className="buywise-highlight">BuyWise</span>
        </h1>
        <div className="chatbot-panel-background">
          <div className="chatbot-messages-container">
            {
              chat.map((msg, i) => (
                <ChatMessage key={i} speaker={msg.speaker} text={msg.text} />
              ))
            }
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input-container">
            {
              isPastChat? (
                <textarea
                  ref={textareaRef}
                  className="chatbot-textarea textarea-disabled"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Past chats are not editable!"
                  rows={3}
                  disabled={true}
                />
              ) :
              (
                <textarea
                  ref={textareaRef}
                  className="chatbot-textarea"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message here..."
                  rows={3}
                />
              )
            }          
            <button
              className="chatbot-send-button"
              onClick={handleSendMessage}
              disabled={!userInput.trim() || isLoading || isPastChat}
            >
              {
                isLoading ? (
                  <span className="chatbot-loading-indicator">...</span>
                ) : (
                  'Send'
                )
              }
            </button>
          </div>
        </div>          
      </div>

    </>
  );
}

function ScrollChatToBottom({
  messagesEndRef,
  chat
}) {
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);
}

function AutoResizeTextArea({
  textareaRef,
  userInput
}) {
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [userInput]);
}