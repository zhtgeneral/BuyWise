import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { Button } from "@mantine/core";
import ProductGrid from "../components/ProductGrid";
import ChatDrawer from "../components/ChatDrawer";
import { useDispatch, useSelector } from "react-redux";
import { selectProducts } from "../libs/features/productsSlice";
import { addMessage, clearChat } from "../libs/features/chatSlice";
import { fetchChatHistory, selectChats } from "../libs/features/historySlice";
import "../styles/ChatPage.css";

/** This is the page where the user can chat with the AI for products */
export default function ChatPage() {
  const [opened, setOpened] = useState(false);
  const [showProduct, setShowProduct] = useState(false);
  
  // Get chat messages directly from Redux
  const chat = useSelector(state => state.chat.messages);
  const products = useSelector(selectProducts);
  const userEmail = useSelector(state => state.profile?.user?.email); // adjust selector as needed
  const pastChats = useSelector(state => state.history?.chats || []);
  const allChats = useSelector(selectChats);
  const dispatch = useDispatch();
  const chatRef = useRef(chat);
  const emailRef = useRef(userEmail);
  const pastChatsRef = useRef(pastChats);
  const location = useLocation();
  useEffect(() => {
    chatRef.current = chat;
    emailRef.current = userEmail;
    pastChatsRef.current = pastChats;
  }, [chat, userEmail, pastChats]);

  // Show products if there are any in the current chat/products state
  useEffect(() => {
    if (products && products.length > 0) {
      setShowProduct(true);
    } else {
      setShowProduct(false);
    }
  }, [products]);

  useEffect(() => {
    const saveChat = () => {
      if (chatRef.current.length > 1) {
        const payload = { messages: chatRef.current, email: emailRef.current };
        axios.post("http://localhost:3000/api/chats", payload, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }); // fire-and-forget
        dispatch(clearChat());
        if (userEmail) {
          dispatch(fetchChatHistory(userEmail));
        }
      }
    };
    return () => {
      saveChat();
    };
  }, [location.pathname, dispatch]);

  // Save chat on refresh/close
useEffect(() => {
  const handleBeforeUnload = () => {
    if (chatRef.current.length > 1) {
      const payload = { messages: chatRef.current, email: emailRef.current };
      fetch("http://localhost:3000/api/chats", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
        keepalive: true
      }).catch(err => console.error('Failed to save chat on unload:', err));
      if (userEmail) {
        dispatch(fetchChatHistory(emailRef.current));
      }
    }
  };
  window.addEventListener("beforeunload", handleBeforeUnload);
  return () => window.removeEventListener("beforeunload", handleBeforeUnload);
}, [dispatch]);

  const handleOpenChat = () => {
    if (chat.length === 0) {
      dispatch(addMessage({ speaker: "bot", text: "Are you looking for a cellphone or computer?" }));
    }
    setOpened(true);
  };

  // TEMP TEMP TEMP Determine if viewing a past chat
  const isPastChat = /^\/chat\/.+/.test(location.pathname) && location.pathname !== '/chat';
  let displayMessages = chat;
  let displayProducts = products;
  if (isPastChat) {
    const chatId = location.pathname.split('/chat/')[1];
    const found = allChats.find(c => c._id === chatId);
    if (found) {
      displayMessages = found.messages;
      displayProducts = found.messages
        .filter(m => m.speaker === 'bot' && m.recommendedProducts && m.recommendedProducts.length > 0)
        .flatMap(m => m.recommendedProducts);
    }
  }

  return (
    <main className="chat-page">
      <h1>
        Welcome to <span className="buywise-highlight">BuyWise</span>
      </h1>
      <Button className="chat-button" onClick={handleOpenChat}>
        Open Chat
      </Button>

      <ChatDrawer
        opened={opened}
        onClose={() => setOpened(false)}
        setShowProduct={setShowProduct}
        messages={displayMessages}
      />

      <ProductGrid products={displayProducts} showProduct={showProduct} />
    </main>
  );
}
