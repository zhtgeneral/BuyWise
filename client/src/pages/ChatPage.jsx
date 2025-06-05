import { useState } from "react";
/** This is tha page where the user can chat with the AI for products */
export default function ChatPage() {
  const [stepIndex, setStepIndex] = useState(0);
  const [chat, setChat] = useState([
    { speaker: 'bot', text: 'Are you looking for a cellphone or computer?' },
  ]);
  const [answers, setAnswers] = useState({
    category: '',
    budgetMax: 0,
    budgetMin: 1000,
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
        <div>
          <button onClick={() => handleAnswer('Cellphone', { category: 'Cellphone' })}>Cellphone</button>
          <button onClick={() => handleAnswer('Computer', { category: 'Computer' })}>Computer</button>
        </div>
      ),
    },
    {
      key: 'budgetMin',
      question: 'What is your budget minimum?',
      input: () => (
        <div>
          <p>Minimum Budget: ${answers.budgetMin}</p>
          <input
            type="range"
            min="0"
            max="50000"
            step="1"
            value={answers.budgetMin}
            onChange={(e) =>
              setAnswers((previous) => ({
                ...previous,
                budgetMin: parseInt(e.target.value),
              }))
            }
          />
          <button
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
        <div>
          <p>Maximum Budget: ${answers.budgetMax}</p>
          <input
            type="range"
            min={answers.budgetMin}
            max="50000"
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
        <div>
          <input
            type="text"
            value={answers.brand}
            onChange={(e) => 
              setAnswers((previous) => ({ ...previous, brand: e.target.value }))
            }
            placeholder="Enter a brand"
          />
          <button onClick={() => handleAnswer(answers.brand || 'No Preference')}>
            Submit
          </button>
        </div>
      ),
    },
    {
      key: 'rating',
      question: 'What is your preferred rating?',
      input: () => (
        <div>
          {[1, 2, 3, 4, 5].map((number) => (
            <button
              key={number}
              onClick={() => handleAnswer(`${number} stars`, { rating: number })}
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
        setChat((prev) => [...prev, { type: 'bot', text: nextStep.question }]);
      }
      setStepIndex(nextStepIndex);
    }, 500);
  };

  return (
    <main>
      <h1>Talk to BuyWise</h1>
      <div>
        {chat.map((message, index) => (
          <div>
            {message.text}
          </div>
        ))}

        {currentStep.input && (
          <div>{currentStep.input()}</div>
        )}

        {currentStep.key === 'results' && (
          <div>
            <h3>Recommended Products</h3>
            <div>Cool</div>
          </div>
        )}
      </div>
    </main>
  )
}