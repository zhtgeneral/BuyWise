import { useState } from "react";
import { Button } from "@mantine/core";
import ProductGrid from "../components/ProductGrid";
import ChatDrawer from "../components/ChatDrawer";
import { useDispatch } from "react-redux";
import { selectProducts } from '../libs/features/productsSlice'
import "../styles/ChatPage.css" 

/** This is tha page where the user can chat with the AI for products */
export default function ChatPage() {
  const [opened, setOpened] = useState(false);
  const [showProduct, setShowProduct] = useState(false);

  const dispatch = useDispatch();
  const products = dispatch(selectProducts);
  
  return (
    <main className="chat-page">
      <h1>Welcome to <span className="buywise-highlight">BuyWise</span></h1>
      <Button className="chat-button" onClick={() => setOpened(true)}>Start Chat</Button>

      <ChatDrawer opened={opened} onClose={() => setOpened(false)} setShowProduct={setShowProduct}/>

      <ProductGrid products={products} showProduct={showProduct} />
    </main>
  );
}
