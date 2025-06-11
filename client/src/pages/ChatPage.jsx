import { useState } from "react";
import { Button } from "@mantine/core";
import ProductGrid from "../components/ProductGrid";
import ChatMessage from "../components/ChatMessage";
import ChatDrawer from "../components/ChatDrawer";
import "../styles/ChatPage.css" 

/** This is tha page where the user can chat with the AI for products */
export default function ChatPage() {
  const [opened, setOpened] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [answers, setAnswers] = useState({
    category: "",
    budgetMax: 0,
    budgetMin: 0,
    brand: "",
    rating: 0,
  });

  return (
    <main className="chat-page">
      <h1>Welcome to <span className="buywise-highlight">BuyWise</span></h1>
      <Button className="chat-button" onClick={() => setOpened(true)}>Start Chat</Button>

      <ChatDrawer
        opened={opened}
        onClose={() => setOpened(false)}
        answers={answers}
        setAnswers={setAnswers}
        setShowResults={setShowResults}
      />

      {showResults && (
        <>
          <h3>Recommended Products</h3>
          <ProductGrid />
        </>
      )}
    </main>
  );
}
