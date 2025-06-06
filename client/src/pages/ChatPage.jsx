import { useState } from "react";
import { Button } from "@mantine/core";
import ProductGrid from "../components/ProductGrid";
import ChatMessage from "../components/ChatMessage";
import ChatDrawer from "../components/ChatDrawer";
// import "../styles/ChatPage.css" superceded by mantine styles, revert if you hate it

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
      <h1>Welcome to BuyWise</h1>
      <div style={{ position: "absolute", top: "1rem", right: "1rem" }}>
        <Button onClick={() => setOpened(true)}>Start Chat</Button>
      </div>

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
