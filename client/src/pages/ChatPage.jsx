import { useState } from "react";
import ProductGrid from "../components/ProductGrid";
import ChatMessage from "../components/ChatMessage";
import "../styles/ChatPage.css"

/** This is tha page where the user can chat with the AI for products */
export default function ChatPage() {
  const MAX_BUDGET = 50000;
  const MIN_BUDGET = 0;
  const [stepIndex, setStepIndex] = useState(0);
  const [chat, setChat] = useState([
    { speaker: 'bot', text: 'Are you looking for a cellphone or computer?' },
  ]);
  const [answers, setAnswers] = useState({
    category: '',
    budgetMax: MIN_BUDGET,
    budgetMin: MIN_BUDGET,
    brand: '',
    rating: 0,
  });

  // Would ideally find some way to store conversation flow in the backend
  // For now since we are only working on frontend I mocked a demo version that
  // Brings user through a mock conversation to display the grid answer component
  const steps = [
    {
      key: 'category',
      question: 'Are you looking for a cellphone or computer?',
      input: () => (
        <div className="chat-input-content">
          <button className="chat-button" onClick={() => handleAnswer('Cellphone', { category: 'Cellphone' })}>Cellphone</button>
          <button className="chat-button" onClick={() => handleAnswer('Computer', { category: 'Computer' })}>Computer</button>
        </div>
      ),
    },
    {
      key: 'budgetMin',
      question: 'What is your budget minimum?',
      input: () => (
        <div className="chat-input-content">
          <p>Minimum Budget: ${answers.budgetMin}</p>
          <input
            type="range"
            min={MIN_BUDGET}
            max={MAX_BUDGET}
            step="1"
            value={answers.budgetMin}
            onChange={(e) =>
              setAnswers((previous) => ({
                ...previous,
                budgetMin: parseInt(e.target.value),
                budgetMax: parseInt(e.target.value),
              }))
            }
          />
          <button
            className="chat-button"
            onClick={() =>
              handleAnswer(`$${answers.budgetMin}`, {
                budgetMin: answers.budgetMin,
              })
            }
          >
            Confirm Budget
          </button>
        </div>
      ),
    },
    {
      key: 'budgetMax',
      question: 'What is your budget maximum?',
      input: () => (
        <div className="chat-input-content">
          <p>Maximum Budget: ${answers.budgetMax}</p>
          <input
            type="range"
            min={answers.budgetMin}
            max={MAX_BUDGET}
            step="1"
            value={answers.budgetMax}
            onChange={(e) =>
              setAnswers((previous) => ({
                ...previous,
                budgetMax: parseInt(e.target.value),
              }))
            }
          />
          <button
            className="chat-button"
            onClick={() =>
              handleAnswer(`$${answers.budgetMax}`, {
                budgetMax: answers.budgetMax,
              })
            }
          >
            Confirm Budget
          </button>
        </div>
      ),
    },
    {
      key: 'brand',
      question: 'Do you have a brand preference?',
      input: () => (
        <div className="chat-input-content">
          <input
            type="text"
            value={answers.brand}
            onChange={(e) =>
              setAnswers((previous) => ({ ...previous, brand: e.target.value }))
            }
            placeholder="Enter a brand"
            className="chat-field-input"
          />
          <button className="chat-button" onClick={() => handleAnswer(answers.brand || 'No Preference')}>
            Submit
          </button>
        </div>
      ),
    },
    {
      key: 'rating',
      question: 'What is your preferred rating?',
      input: () => (
        <div className="chat-input-content">
          {[1, 2, 3, 4, 5].map((number) => (
            <button
              key={number}
              onClick={() => handleAnswer(`${number} stars`, { rating: number })}
              className="chat-button"
            >
              {number}
            </button>
          ))}
        </div>
      ),
    },
    {
      key: 'results',
      question: 'Here is what I found:'
    },
  ];

  const currentStep = steps[stepIndex];

  const handleAnswer = (text, updatedAnswer = {}) => {
    setChat((previous) => [...previous, { speaker: 'user', text }]);
    setAnswers((previous) => ({ ...previous, ...updatedAnswer }));

    const nextStepIndex = stepIndex + 1;

    setTimeout(() => {
      if (nextStepIndex < steps.length) {
        const nextStep = steps[nextStepIndex];
        setChat((prev) => [...prev, { speaker: 'bot', text: nextStep.question }]);
      }
      setStepIndex(nextStepIndex);
    }, 500);
  };

  return (
    <main className="chat-page">
      <h1>Talk to BuyWise</h1>

      <div className="chat-wrapper">
        <div className="chat-container">
          {chat.map((message, index) => (
            <ChatMessage speaker={message.speaker} text={message.text} />
          ))}

          {currentStep.key === 'results' && (
            <div>
              <h3>Recommended Products</h3>
              <ProductGrid />
            </div>
          )}
        </div>
        {currentStep.input && (
          <div className="chat-input-fixed">
            {currentStep.input()}
          </div>
        )}
      </div>
    </main>
  );
}