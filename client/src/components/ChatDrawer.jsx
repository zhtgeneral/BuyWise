import { useState, useRef, useEffect } from 'react';
import { Drawer, Button, Textarea } from '@mantine/core';
import ChatMessage from './ChatMessage';
import { useDispatch, useSelector } from 'react-redux';
import { addMessage, selectChatMessages } from '../libs/features/chatSlice';
import axios from 'axios';
import '../styles/ChatDrawer.css'
import { setProducts } from '../libs/features/productsSlice'

export default function ChatDrawer({ 
  opened, 
  onClose,
  setShowProduct
 }) {
  const dispatch = useDispatch();
  const chat = useSelector(selectChatMessages);

  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);  

  // Auto-scroll to bottom when chat updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

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
        message: userInput
      },{headers :  {
        'Content-Type': 'application/json',
        'Authorization' : `Bearer ${localStorage.getItem('token')}`
      }});
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
      const errorMessage = "Sorry, I encountered an error. Please try again later." 
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

  return (
    <div className="chatdrawer-styles">
      <Drawer
        position="right"
        opened={opened}
        onClose={onClose}
        title="Talk to BuyWise"
        size="xl"
        styles={{
          body: {
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100% - 60px)',
          }
        }}
      >
        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '0.5rem' }}>
          {
            chat.map((msg, i) => (
              <ChatMessage key={i} speaker={msg.speaker} text={msg.text} />
            ))
          }
          <div ref={messagesEndRef} />
        </div>

        <div style={{ display: 'flex', gap: '0.7rem' }}>
          <Textarea
            placeholder="Type your message to BuyWise..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ flex: 1 }}
            className="chatdrawer-input"
            minRows={1}
            maxRows={4}
            autosize
          />
          <Button 
            onClick={handleSendMessage}
            loading={isLoading}
            disabled={!userInput.trim()}
            className="chatdrawer-button"
          >
            Send
          </Button>
        </div>
      </Drawer>
    </div>
  );
}