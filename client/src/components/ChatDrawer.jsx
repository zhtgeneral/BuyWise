import { useState, useRef, useEffect } from 'react';
import { Drawer, Button, Textarea } from '@mantine/core';
import ChatMessage from './ChatMessage';
import axios from 'axios';
import '../styles/ChatDrawer.css'

export default function ChatDrawer({ opened, onClose }) {
  const [chat, setChat] = useState([
    { 
      speaker: "bot", 
      text: "Hello! How can I help you today?" 
    }
  ]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when chat updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  const handleSendMessage = async () => {
    /** This prevents empty messages from being sent */
    if (!userInput.trim()) return; 
    
    // Add user message to chat
    const newUserMessage = { 
      speaker: "user", 
      text: userInput 
    };
    setChat(prev => [...prev, newUserMessage]);
    setUserInput("");

    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/api/chatbot', {
        message: userInput
      });
      if (response.status === 200) {
        const chatbotMessage = response.data.chatbotMessage;
        setChat(prev => [
          ...prev, 
          { 
            speaker: "bot",
             text: chatbotMessage 
          }
        ]);
      } else {
        setChat(prev => [
          ...prev, 
          { 
            speaker: "bot", 
            text: "My output is displaying incorrectly, but my internals are working. Sorry for the inconvenience."
          }
        ]);
      }      
    } catch (error) {
      console.error('Error:', error);
      setChat(prev => [
        ...prev, 
        { 
          speaker: "bot", 
          text: "Sorry, I encountered an error. Please try again later." 
        }
      ]);
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