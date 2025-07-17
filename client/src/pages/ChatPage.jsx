import "../styles/ChatPage.css";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import ProductGrid from "../components/ProductGrid";
import { selectProducts, clearProducts, loadPastProducts } from "../libs/features/productsSlice";
import { selectChatById } from "../libs/features/historySlice";
import { loadPastChat, clearChat, selectChatMessages } from "../libs/features/chatSlice";
import ChatbotPanel from "../components/ChatbotPanel";

/** This is the page where the user can chat with the AI for products */
export default function ChatPage() {
  const dispatch = useDispatch();
  const location = useLocation();
  
  // Get current chat data from Redux
  const chat = useSelector(selectChatMessages);
  const products = useSelector(selectProducts);
  
  // Extract chatId from URL
  const chatId = location.pathname.split('/chat/')[1] || null;
  const isNewChat = !chatId;
  
  // Get past chat data if viewing historical chat
  const pastChatData = useSelector(selectChatById(chatId || ''));

  // Load appropriate chat data based on URL
  useEffect(() => {
    if (isNewChat) {
      dispatch(clearChat());
      dispatch(clearProducts());
    } else if (chatId && pastChatData) {
      dispatch(loadPastChat({ 
        chatId: chatId, 
        messages: pastChatData.messages 
      }));
      
      // Extract and load products from past chat
      const pastProducts = pastChatData.messages
        .filter(m => m.speaker === 'bot' && m.recommendedProducts && m.recommendedProducts.length > 0)
        .map(m => m.recommendedProducts);
      
      if (pastProducts.length > 0) {
        const latestProducts = pastProducts[pastProducts.length - 1];
        const previousProducts = pastProducts.slice(0, -1);
        dispatch(loadPastProducts({ 
          products: latestProducts, 
          pastProducts: previousProducts 
        }));
      } else {
        dispatch(clearProducts());
      }
    }
  }, [location.pathname, dispatch, isNewChat, chatId, pastChatData]);

  return (
    <>
      {/* UI */}
      <main className="chat-page">    
        <ChatbotPanel 
          messages={chat}
        />
        <ProductGrid 
          products={products}
          showProduct={products.length > 0}         
        />
      </main>
    </>   
  );
}