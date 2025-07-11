import "../styles/ChatPage.css";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import ProductGrid from "../components/ProductGrid";
import { selectProducts } from "../libs/features/productsSlice";
import { clearChat } from "../libs/features/chatSlice";
import { fetchChatHistory, selectChats } from "../libs/features/historySlice";
import ChatbotPanel from "../components/ChatbotPanel";

/** This is the page where the user can chat with the AI for products */
export default function ChatPage() {
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

  const [showProduct, setShowProduct] = useState(false);  

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

  useEffect(() => {
    chatRef.current = chat;
    emailRef.current = userEmail;
    pastChatsRef.current = pastChats;
  }, [chat, userEmail, pastChats]);

  return (
    <>
      {/* UI */}
      <main className="chat-page">    
        <ChatbotPanel 
          messages={displayMessages}
          setShowProduct={setShowProduct}
        />
        <ProductGrid 
          products={displayProducts} 
          showProduct={showProduct}         
        />
      </main>

      {/* React useEffects */}
      <DisplayProductsForChat 
        displayProducts={displayProducts} 
        setShowProduct={setShowProduct}           
      />
      <SaveChatOnUnload 
        chatRef={chatRef}
        emailRef={emailRef}
        userEmail={userEmail}
        dispatch={dispatch}
      />
      <PostChatData 
        chatRef={chatRef}
        emailRef={emailRef}
        dispatch={dispatch}
        userEmail={userEmail}
      />
    </>   
  );
}

// Show products if there are any in the current chat/products state
function DisplayProductsForChat({
  displayProducts,
  setShowProduct
}) {
  useEffect(() => {
    if (displayProducts && displayProducts.length > 0) {
      setShowProduct(true);
    } else {
      setShowProduct(false);
    }
  }, [displayProducts, setShowProduct]);
}

// Save chat on refresh/close
function SaveChatOnUnload({
  chatRef, 
  emailRef,
  userEmail,
  dispatch
}) {
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
  }, [dispatch, userEmail]);
}

function PostChatData({
  chatRef,
  emailRef,
  dispatch,
  userEmail
}) {
  useEffect(() => {
    const saveChat = () => {
      if (chatRef.current.length > 1) {
        const payload = { 
          messages: chatRef.current, 
          email: emailRef.current 
        };
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
  }, [location.pathname]);
}