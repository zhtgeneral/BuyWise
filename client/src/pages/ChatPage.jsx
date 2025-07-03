import { useState, useEffect, useRef } from "react";
import { Button } from "@mantine/core";
import ProductGrid from "../components/ProductGrid";
import ChatDrawer from "../components/ChatDrawer";
import { useDispatch, useSelector } from "react-redux";
import { selectUserOptions } from "../libs/features/userSlice";
import { selectProducts } from "../libs/features/productsSlice";
import { selectChatMessages, clearChat } from "../libs/features/chatSlice";
import axios from "axios";
import "../styles/ChatPage.css";

/** This is tha page where the user can chat with the AI for products */
export default function ChatPage() {
  const [opened, setOpened] = useState(false);
  const [showProduct, setShowProduct] = useState(false);
  const chat = useSelector(selectChatMessages);
  const userOptions = useSelector(selectUserOptions);

  const dispatch = useDispatch();
  const products = dispatch(selectProducts);

  // Refs to always have latest chat and email
  const chatRef = useRef(chat);
  const emailRef = useRef(userOptions.email);

  useEffect(() => {
    chatRef.current = chat;
    emailRef.current = userOptions.email;
  }, [chat, userOptions.email]);

  // Save chat on unmount
  useEffect(() => {
    const saveChat = () => {
      if (chatRef.current.length > 0) {
        console.log(
          "Cleanup: Saving and clearing chat on unmount",
          chatRef.current,
          emailRef.current
        );
        const payload = { messages: chatRef.current, email: "Rizz@mail.ca"}; // temporary email
        axios.post("http://localhost:3000/api/chats", payload, {headers :  {
          'Content-Type': 'application/json',
          'Authorization' : `Bearer ${localStorage.getItem('token')}`
        }}); // fire-and-forget
        dispatch(clearChat());
      }
    };
    return () => {
      saveChat();
    };
  }, [dispatch]);

  // Save chat on refresh/close
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (chatRef.current.length > 0) {
        const payload = { messages: chatRef.current, email: "Rizz@mail.ca" }; // temporary email
        fetch("http://localhost:3000/api/chats", {
          method: "POST",
          body: JSON.stringify(payload),
          headers: { "Content-Type": "application/json" },
          keepalive: true
        }).catch(err => console.error('Failed to save chat on unload:', err));
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dispatch]);

  return (
    <main className="chat-page">
      <h1>
        Welcome to <span className="buywise-highlight">BuyWise</span>
      </h1>
      <Button className="chat-button" onClick={() => setOpened(true)}>
        Start Chat
      </Button>

      <ChatDrawer
        opened={opened}
        onClose={() => setOpened(false)}
        setShowProduct={setShowProduct}
      />

      <ProductGrid products={products} showProduct={showProduct} />
    </main>
  );
}
