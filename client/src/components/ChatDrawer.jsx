import { useState } from "react";
import {
  Drawer,
  Button,
  Input,
  RangeSlider,
  Group,
  Stack,
} from "@mantine/core";
import ChatMessage from "./ChatMessage";

export default function ChatDrawer({
  opened,
  onClose,
  answers,
  setAnswers,
  setShowResults,
}) {
  const MAX_BUDGET = 50000;
  const MIN_BUDGET = 0;
  const [stepIndex, setStepIndex] = useState(0);
  const [chat, setChat] = useState([
    { speaker: "bot", text: "Are you looking for a cellphone or computer?" },
  ]);

  // Would ideally find some way to store conversation flow in the backend
  // For now since we are only working on frontend I mocked a demo version that
  // Brings user through a mock conversation to display the grid answer component
  const steps = [
    {
      key: "category",
      question: "Are you looking for a cellphone or computer?",
      input: () => (
        <Group>
          <Button
            onClick={() => handleAnswer("Cellphone", { category: "Cellphone" })}
          >
            Cellphone
          </Button>
          <Button
            onClick={() => handleAnswer("Computer", { category: "Computer" })}
          >
            Computer
          </Button>
        </Group>
      ),
    },
    {
      key: "budgetMin",
      question: "What is your budget minimum?",
      input: () => (
        <Stack>
          <p>Minimum Budget: ${answers.budgetMin}</p>
          <RangeSlider
            min={MIN_BUDGET}
            max={MAX_BUDGET}
            step={1}
            value={[answers.budgetMin, answers.budgetMin]}
            onChange={(value) =>
              setAnswers((previous) => ({
                ...previous,
                budgetMin: value[0],
                budgetMax: value[0],
              }))
            }
          />
          <Button
            onClick={() =>
              handleAnswer(`$${answers.budgetMin}`, {
                budgetMin: answers.budgetMin,
              })
            }
          >
            Confirm Budget
          </Button>
        </Stack>
      ),
    },
    {
      key: "budgetMax",
      question: "What is your budget maximum?",
      input: () => (
        <Stack>
          <p>Maximum Budget: ${answers.budgetMax}</p>
          <RangeSlider
            min={answers.budgetMin}
            max={MAX_BUDGET}
            step={1}
            value={[answers.budgetMax, answers.budgetMax]}
            onChange={(value) =>
              setAnswers((previous) => ({
                ...previous,
                budgetMax: value[0],
              }))
            }
          />
          <Button
            onClick={() =>
              handleAnswer(`$${answers.budgetMax}`, {
                budgetMax: answers.budgetMax,
              })
            }
          >
            Confirm Budget
          </Button>
        </Stack>
      ),
    },
    {
      key: "brand",
      question: "Do you have a brand preference?",
      input: () => (
        <Stack>
          <Input
            value={answers.brand}
            placeholder="Enter a brand"
            onChange={(e) =>
              setAnswers((previous) => ({ ...previous, brand: e.target.value }))
            }
          />
          <Button
            onClick={() => handleAnswer(answers.brand || "No Preference")}
          >
            Submit
          </Button>
        </Stack>
      ),
    },
    {
      key: "rating",
      question: "What is your preferred rating?",
      input: () => (
        <Group>
          {[1, 2, 3, 4, 5].map((number) => (
            <Button
              key={number}
              onClick={() =>
                handleAnswer(`${number} stars`, { rating: number })
              }
            >
              {number}
            </Button>
          ))}
        </Group>
      ),
    },
    {
      key: "results",
      question: "Here is what I found:",
    },
  ];

  const currentStep = steps[stepIndex];

  const handleAnswer = (text, updatedAnswer = {}) => {
    setChat((previous) => [...previous, { speaker: "user", text }]);
    setAnswers((previous) => ({ ...previous, ...updatedAnswer }));

    const nextStepIndex = stepIndex + 1;

    setTimeout(() => {
      if (nextStepIndex < steps.length) {
        const nextStep = steps[nextStepIndex];
        setChat((prev) => [
          ...prev,
          { speaker: "bot", text: nextStep.question },
        ]);
      }
      if (steps[nextStepIndex].key === "results") {
        setShowResults(true);
      }
      setStepIndex(nextStepIndex);
    }, 400);
  };

  return (
    <Drawer
      position="right"
      opened={opened}
      onClose={onClose}
      title="Talk to BuyWise"
      size="lg"
    >
      {chat.map((msg, i) => (
        <ChatMessage key={i} speaker={msg.speaker} text={msg.text} />
      ))}
      {currentStep.input && currentStep.input()}
    </Drawer>
  );
}
