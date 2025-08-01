import '../styles/ChatbotPanel.css';
import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import Browser from '../utils/browser';

import ChatMessage from './ChatMessage';
import { 
  addMessage, 
  selectConversationId, 
  setConversationId,
  selectChatMessages
} from '../libs/features/chatSlice';
import { setProducts } from '../libs/features/productsSlice';
import { 
  addNewChatToHistory, 
  updateChatInHistory 
} from '../libs/features/historySlice';
import { OrbitProgress, ThreeDot } from 'react-loading-indicators'

export default function ChatbotPanel() {
  let chat = useSelector(selectChatMessages);
  const dispatch = useDispatch();
  const conversationId = useSelector(selectConversationId);

  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  function addChatToHistorySidebar(newMessage, responseConversationId = null) {
    const finalConversationId = responseConversationId || conversationId;
    if (finalConversationId) {
      const chatHistoryEntry = {
        _id: finalConversationId,
        messages: [...chat, newMessage],
        createdAt: new Date().toISOString()
      };

      if (responseConversationId && responseConversationId !== conversationId) {
        // New chat - add to history
        dispatch(addNewChatToHistory(chatHistoryEntry));
      } else {
        // Existing chat - update in history
        dispatch(updateChatInHistory({ 
          chatId: finalConversationId, 
          updatedChat: chatHistoryEntry 
        }));
      }
    }
  }

  async function handleSendMessage() {
    if (!userInput.trim()) return;
    
    const newUserMessage = { 
      speaker: "user", 
      text: userInput 
    };

    dispatch(addMessage(newUserMessage));
    chat = [...chat, newUserMessage];
    setUserInput("");

    setIsLoading(true);
    try {
      var response = await axios.post('http://localhost:3000/api/chatbot', {
        message: userInput,
        conversationId: conversationId, 
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Browser.getToken()}`
        }
      });      
    } catch (error) {
      console.error('ChatbotPanel error:', error);
      const errorMessage = { 
        speaker: "bot", 
        text: "Sorry, I encountered an error. Please try again later."
      };
      dispatch(addMessage(errorMessage));
      addChatToHistorySidebar(errorMessage);      
      setIsLoading(false);
      return;
    } 

    if (response.status !== 200) {
      const errorMessage = { 
        speaker: "bot", 
        text: "My output is displaying incorrectly, but my internals are working. Sorry for the inconvenience."
      };
      dispatch(addMessage(errorMessage));      
      addChatToHistorySidebar(errorMessage);
      setIsLoading(false);
      return;
    }
    
    const { 
      chatbotMessage, 
      responseConversationId,
      productData
    } = response.data;

    const botMessage = productData?.length > 0 
      ? {
          speaker: "bot", 
          text: chatbotMessage,
          recommendedProducts: productData
        }
      : {
          speaker: "bot", 
          text: chatbotMessage     
        };
    
    dispatch(addMessage(botMessage));
    addChatToHistorySidebar(botMessage, responseConversationId);
    if (productData?.length > 0) {
      dispatch(setProducts(productData));
    }
    if (responseConversationId && responseConversationId !== conversationId) {
      // Update conversationId in Redux if we got one back
      dispatch(setConversationId(responseConversationId));
    }
    setIsLoading(false);
  };

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading) {
        handleSendMessage();
      }
    }
  }

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
            />      
          </div>

          <div className="chatbot-input-container">
            <ChatbotInput 
              textareaRef={textareaRef}
              userInput={userInput}
              handleKeyDown={handleKeyDown}
              setUserInput={setUserInput}
            />
            <ChatbotButton 
              isLoading={isLoading}
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
  isLoading
}) {
  if (!isLoading) return null;
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
  textareaRef, 
  userInput,
  handleKeyDown,
  setUserInput
}) {
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
  handleSendMessage,
  isInputEmpty
}) {  
  let buttonText;
  if (isLoading) {
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
      disabled={isInputEmpty || isLoading}
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