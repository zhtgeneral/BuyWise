import '../styles/ChatbotPanel.css';
import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';

import ChatMessage from './ChatMessage';

import { addMessage, selectChatMessages } from '../libs/features/chatSlice';
import { selectProfileUser } from '../libs/features/profileSlice';
import { setProducts } from '../libs/features/productsSlice';

export default function ChatbotPanel({
  messages,
  setShowProduct,
}) {
  const dispatch = useDispatch();
  const reduxChat = useSelector(selectChatMessages);
  const userProfile = useSelector(selectProfileUser);
  const location = useLocation();

  const chat = messages ?? reduxChat;
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to bottom when chat updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [userInput]);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    
    const newUserMessage = { 
      speaker: "user", 
      text: userInput 
    };
    dispatch(addMessage(newUserMessage));
    setUserInput("");

    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/api/chatbot', {
        message: userInput,
        userId: userProfile?._id,
        email: userProfile?.email
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.status === 200) {
        const chatbotMessage = response.data.chatbotMessage;
        const productData = response.data.productData;
        const botMessage = { speaker: "bot", text: chatbotMessage };
        if (productData && productData.length > 0) {
          botMessage.recommendedProducts = productData;
          dispatch(setProducts(productData));
          setShowProduct(true);
        }
        dispatch(addMessage(botMessage));
      } else {
        const unsuccessfulMessage = "My output is displaying incorrectly, but my internals are working. Sorry for the inconvenience.";
        dispatch(addMessage({ speaker: "bot", text: unsuccessfulMessage }));
      }      
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = "Sorry, I encountered an error. Please try again later.";
      dispatch(addMessage({ speaker: "bot", text: errorMessage }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const isPastChat = /^\/chat\/.+/.test(location.pathname) && location.pathname !== '/chat';

  return (
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
          <textarea
            ref={textareaRef}
            className="chatbot-textarea"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here..."
            rows={3}
          />
          <button
            className="chatbot-send-button"
            onClick={handleSendMessage}
            disabled={!userInput.trim() || isLoading || isPastChat}
          >
            {isLoading ? (
              <span className="chatbot-loading-indicator">...</span>
            ) : (
              'Send'
            )}
          </button>
        </div>
      </div>          
    </div>
  );
}