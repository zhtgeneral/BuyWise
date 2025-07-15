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
import { OrbitProgress, ThreeDot } from 'react-loading-indicators'

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

    if (response.status !== 200) {
      dispatch(addMessage({ 
        speaker: "bot", 
        text: "My output is displaying incorrectly, but my internals are working. Sorry for the inconvenience."
      }));
      setIsLoading(false);
      return;
    }
    
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
      setIsLoading(false);
      return;
    } 

    dispatch(addMessage({
      speaker: "bot", 
      text: chatbotMessage     
    }));        
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
        <h1>Talk to <span className="buywise-highlight">BuyWise</span></h1>

        <div className="chatbot-panel-background">        
          <div className="chatbot-messages-portal">
            <ChatbotMessages 
              chat={chat}
              messagesEndRef={messagesEndRef}
            />
            <ConditionalLoadingIndicator 
              isLoading={isLoading}
              isPastChat={isPastChat}
            />      
          </div>

          <div className="chatbot-input-container">
            <ChatbotInput 
              isPastChat={isPastChat}
              textareaRef={textareaRef}
              userInput={userInput}
              handleKeyDown={handleKeyDown}
              setUserInput={setUserInput}
            />
            <ChatbotButton 
              isLoading={isLoading}
              isPastChat={isPastChat}
              handleSendMessage={handleSendMessage}
              isInputEmpty={userInput.trim() === ''}
            />
          </div>
        </div>          
      </div>

    </>
  );
}

function ChatbotMessages({
  chat,
  messagesEndRef
}) {
  return (
    <div className="chatbot-messages-container">
      {chat.map((msg, i) => 
        <ChatMessage 
          key={i} 
          speaker={msg.speaker} 
          text={msg.text}                   
        />)
      }
      <div ref={messagesEndRef} />
    </div>
  )
}

function ConditionalLoadingIndicator({
  isLoading,
  isPastChat
}) {
  if (isPastChat || !isLoading) return null;
  return (
    <span style={{ textAlign: 'left' }}>
      <ThreeDot
        variant="bounce" 
        color={["#faad79", "#206599", "#faad79", "#206599"]}  
        size="medium"
        speedPlus='-3' 
        easing='ease-in-out'
      />
    </span>
  )
}

function ChatbotInput({
  isPastChat,
  textareaRef, 
  userInput,
  handleKeyDown,
  setUserInput
}) {
  if (isPastChat) {
    return (
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
    )
  } 
  return (
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

function ChatbotButton({
  isLoading,
  isPastChat,
  handleSendMessage,
  isInputEmpty
}) {  
  let buttonText;
  if (isPastChat) {
    buttonText = <span className="chatbot-disabled-indicator">🔒</span>
  } else if (isLoading) {
    buttonText = 
      <OrbitProgress 
        style={{ fontSize: '8px' }} 
        color={["#77abd4", "#206599", "#77abd4", "#206599"]} 
        size='small' 
        dense
        speedPlus='-3'      
      />
  } else {
    buttonText = 'Send'
  }
  return (
    <button
      className="chatbot-send-button"
      onClick={handleSendMessage}
      disabled={isInputEmpty || isLoading || isPastChat}
    >
      {buttonText}
    </button>
  )
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