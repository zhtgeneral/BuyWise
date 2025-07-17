import "../styles/ChatPage.css";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import ProductGrid from "../components/ProductGrid";
import ChatbotPanel from "../components/ChatbotPanel";
import { 
  selectProducts, 
  clearProducts, 
  loadPastProducts, 
  selectPastProducts 
} from "../libs/features/productsSlice";
import {
  loadPastChat, 
  clearChat, 
} from "../libs/features/chatSlice";
import { 
  selectChatById 
} from "../libs/features/historySlice";

/** This is the page where the user can chat with the AI for products */
export default function ChatPage() {  
  const products = useSelector(selectProducts); // gets updated by LoadChatAndProductById component
  const pastProducts = useSelector(selectPastProducts); // gets updated by LoadChatAndProductById component

  return (
    <>
      {/* State updates */}
      <LoadChatAndProductById />
      {/* UI */}
      <main className="chat-page">    
        <ChatbotPanel />
        <ProductGrid 
          showProduct={products.length > 0 || pastProducts.length > 0}
          products={products}
          pastProducts={pastProducts}
        />
      </main>
    </>   
  );
}

// This component acts as a function to update redux
function LoadChatAndProductById() {
  const dispatch = useDispatch();
  const location = useLocation();

  const chatId = location.pathname.split('/chat/')[1] || null; // TODO use redux state instead of manual parse
  const pastChatData = useSelector(selectChatById(chatId || ''));

  useEffect(() => {
    if (!chatId) {
      dispatch(clearChat());
      dispatch(clearProducts());
      return;
    } 
    
    if (pastChatData) {      
      const messages = pastChatData.messages;
      const pastProducts = getPastProductsFromMessages(messages);

      dispatch(loadPastChat({ chatId, messages }));
      conditionallyLoadProducts(pastProducts);  
    }
  }, [location.pathname, pastChatData]);

  function conditionallyLoadProducts(pastProducts) {
    if (pastProducts.length === 0) {
      return dispatch(clearProducts());
    }
    
    const [previousProducts, latestProducts] = separateProductsPreviousLatest(pastProducts);
    dispatch(loadPastProducts({ 
      products: latestProducts, 
      pastProducts: previousProducts 
    }));  
  }
}

function getPastProductsFromMessages(messages) {
  return messages
    .filter(m => m.speaker === 'bot' && m.recommendedProducts && m.recommendedProducts.length > 0)
    .map(m => m.recommendedProducts);
}

function separateProductsPreviousLatest(pastProducts) {
  const latestProducts = pastProducts[pastProducts.length - 1];
  const previousProducts = pastProducts.slice(0, -1);
  return [previousProducts, latestProducts]
}