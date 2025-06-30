import { ChatOpenAI } from "@langchain/openai";
import { DynamicTool } from "@langchain/core/tools";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { BufferMemory } from "langchain/memory";
import { ProductService } from "../services/ProductService";
import { randomUUID } from 'crypto';

// TODO: Find a better way to sync product data with asynchronous tool calls
let lastProductData: any[] = [];

function formatProductForFrontend(products: any[]) {
  const formattedProducts = products.map((p) => {
    console.log("formatProductForFrontend: product seller details" + JSON.stringify(p.seller_details, null, 2));
    return {
      id: p.product_id || randomUUID(),
      source: p.source || "",
      title: p.title || "",
      image: p.thumbnail || "",
      price: p.extracted_price || 0,
      url: p.seller_details.direct_link || "",
      rating: p.rating || 0, // new field
      reviews: p.reviews || 0 // new field
    }
  })
  return formattedProducts;
}

// Product search tool
const productSearchTool = new DynamicTool({
  name: "product_search",
  description: "Search for laptops, phones, or computers using a product query string.",
  func: async (input: string) => {
    console.log("Tool Invoked: product_search with input:", input);
    const products = await ProductService.searchProducts(input);
    lastProductData = formatProductForFrontend(products);
    return JSON.stringify(lastProductData.slice(0, 3));
  },
});

// Price comparison tool
const priceComparisonTool = new DynamicTool({
  name: "price_comparison",
  description: "Compare prices and find budget-friendly options",
  func: async (input: string) => {
    console.log("Tool Invoked: price_comparison with input:", input);
    const products = await ProductService.searchProducts(input);
    const sortedByPrice = products.sort((a, b) => (a.extracted_price || 0) - (b.extracted_price || 0));
    lastProductData = formatProductForFrontend(products);
    return JSON.stringify({
      cheapest: sortedByPrice.slice(0, 3),
      mostExpensive: sortedByPrice.slice(-2),
      averagePrice: products.reduce((sum, p) => sum + (p.extracted_price || 0), 0) / products.length
    });
  },
});

// Drill down on product categories tool
const categoryTool = new DynamicTool({
  name: "category_insights",
  description: "Get insights about product categories and recommendations",
  func: async (input: string) => {
    console.log("Tool Invoked: category_insights with input:", input);

    // Maybe beef this up a bit with more categories
    const categories = {
      laptop: ['productivity', 'gaming', 'ultrabook', 'business'],
      phone: ['budget', 'flagship', 'camera-focused', 'gaming'],
      computer: ['desktop', 'workstation', 'gaming-pc', 'mini-pc']
    };
    const inputLower = input.toLowerCase();
    for (const [category, subcategories] of Object.entries(categories)) {
      if (inputLower.includes(category)) {
        return JSON.stringify({
          category,
          subcategories,
          recommendation: `For ${category}s, consider your primary use case: ${subcategories.join(', ')}`
        });
      }
    }
    return JSON.stringify({
      message: "I can help you with laptops, phones, and computers. What are you looking for?"
    });
  },
});

// Stop irrelevant queries tool
const focusCheckTool = new DynamicTool({
  name: "check_topic_relevance",
  description: "Check if the user's question is related to shopping for laptops, phones, or computers. Use this for any non-product related questions.",
  func: async (input: string) => {
    console.log("Tool Invoked: check_topic_relevance with input:", input);
    const techKeywords = ['laptop', 'phone', 'computer', 'pc', 'mobile', 'device', 'tech', 'buy', 'purchase', 'price', 'compare', 'recommendation', 'specs', 'features'];
    const inputLower = input.toLowerCase();
    const isRelevant = techKeywords.some(keyword => inputLower.includes(keyword));
    
    if (!isRelevant) {
      return JSON.stringify({
        relevant: false,
        message: "I'm BuyWise, your shopping assistant for laptops, phones, and computers. I can help you find the perfect tech products, compare prices, and get recommendations. What device are you looking for?"
      });
    }
    
    return JSON.stringify({
      relevant: true,
      message: "This question is relevant to my expertise in tech shopping."
    });
  },
});

const tools = [productSearchTool, priceComparisonTool, categoryTool, focusCheckTool];

const llm = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  modelName: "gpt-4.1-nano",
  temperature: 0.2,
  maxTokens: 1000,
});

// TODO: Chatbot can sometimes be kinda rude, maybe make it less aggressive
const systemPrompt = `
You are BuyWise, a specialized shopping assistant ONLY for laptops, phones, and computers. You must ONLY help with technology shopping and product recommendations.

STRICT RULES:
- NEVER answer questions unrelated to laptops, phones, computers, or tech shopping
- If asked about anything else (weather, cooking, general knowledge, etc.), politely redirect to tech shopping
- Always use the check_topic_relevance tool for unclear or non-tech questions
- Your sole purpose is helping users find and compare tech products

Your capabilities:
- Search for laptops, phones, and computers
- Compare prices and find budget-friendly options  
- Provide category insights and tech recommendations
- Remember conversation context for personalized shopping advice

Guidelines:
- Be enthusiastic about technology shopping
- Ask follow-up questions about tech needs (budget, use case, preferences)
- When showing products, highlight key features
- If users mention budget concerns, suggest alternatives
- ALWAYS redirect non-tech topics back to device shopping
- Use tools appropriately: product_search for finding products, price_comparison for budget questions, category_insights for recommendations, check_topic_relevance for off-topic questions
`;

// Use BufferMemory for conversation context
const memoryMap = new Map<string, BufferMemory>();

// Wrapper to initialize the agent executor
async function getAgentExecutor(sessionId: string) {
  if (!memoryMap.has(sessionId)) {
    memoryMap.set(
      sessionId,
      new BufferMemory({
        memoryKey: "chat_history",
        returnMessages: true,
        inputKey: "input",
        outputKey: "output",
      })
    );
  }
  const memory = memoryMap.get(sessionId)!;
  
  const chatModel = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    modelName: "gpt-4.1-nano",
    temperature: 0.2,
    maxTokens: 1000,
  });
  
  // Apparently this is now deprecated...? Look up LangGraph alternative
  return initializeAgentExecutorWithOptions(tools, chatModel, {
    agentType: "chat-conversational-react-description",
    verbose: false,
    memory,
    agentArgs: {
      systemMessage: systemPrompt,
    },
  });
}

export async function chatWithAgent(userInput: string, sessionId: string = 'default') {
  try {
    // Clear previous product data
    lastProductData = [];
    
    // Pre-filter obviously off-topic questions
    const offTopicKeywords = ['weather', 'recipe', 'cooking', 'movie', 'music', 'sports', 'politics', 'news', 'joke', 'story', 'game', 'math', 'history', 'geography'];
    const techKeywords = ['laptop', 'phone', 'computer', 'pc', 'mobile', 'device', 'tech', 'buy', 'purchase', 'price', 'compare', 'recommendation', 'specs', 'features', 'apple', 'samsung', 'dell', 'hp', 'android', 'ios', 'windows', 'mac'];
    
    const inputLower = userInput.toLowerCase();
    const hasOffTopicKeywords = offTopicKeywords.some(keyword => inputLower.includes(keyword));
    const hasTechKeywords = techKeywords.some(keyword => inputLower.includes(keyword));
    
    // If clearly off-topic and no tech keywords, redirect immediately
    if (hasOffTopicKeywords && !hasTechKeywords) {
      return {
        message: "I'm BuyWise, your specialized shopping assistant for laptops, phones, and computers! I can help you find the perfect tech products, compare prices, and get recommendations. What device are you looking for today?",
        productData: null
      };
    }
    
    const agentExecutor = await getAgentExecutor(sessionId);
    const result = await agentExecutor.invoke({ input: userInput });
    const response = result.output || result.result || "Sorry, I couldn't find an answer.";
    
    // Return both the response and any product data that was found
    return {
      message: response,
      productData: lastProductData.length > 0 ? lastProductData : null
    };
  } catch (error) {
    console.error('Error in chatWithAgent:', error);
    return {
      message: "I'm sorry, I encountered an error. Please try again.",
      productData: null
    };
  }
}
