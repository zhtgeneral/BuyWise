import { ChatOpenAI } from "@langchain/openai";
import { DynamicTool } from "@langchain/core/tools";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { BufferMemory } from "langchain/memory";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { ProductService } from "../services/ProductService";
import { randomUUID } from 'crypto';

// Memory with TTL tracking
interface MemoryActivity {
  memory: BufferMemory;
  lastActivity: number;
}

const MEMORY_TTL = 30 * 60 * 1000; // 30 minutes
let cleanupInterval: NodeJS.Timeout | null = null;

// TODO: Find a better way to sync product data with asynchronous tool calls
let lastProductData: any[] = [];

function formatProductForFrontend(products: any[], userId?: string) {
  const formattedProducts = products.map((p) => {
    console.log("formatProductForFrontend: product seller details" + JSON.stringify(p.seller_details, null, 2));
    return {
      id: p.product_id || randomUUID(),
      source: p.source || "",
      title: p.title || "",
      image: p.thumbnail || "",
      price: p.extracted_price || 0,
      url: p.seller_details.direct_link ? ProductService.createProxyUrl(p.seller_details.direct_link, {product_id : p.product_id,source : p.source,title : p.title,price: p.extracted_price },userId) : "",
      rating: p.rating || 0,
      reviews: p.reviews || 0
    }
  })
  return formattedProducts;
}

// Function to create tools with access to userId
function createTools(userId?: string) {
  // Product search tool
  const productSearchTool = new DynamicTool({
    name: "product_search",
    description: "Search for laptops, phones, or computers using a product query string.",
    func: async (input: string) => {
      console.log("Tool Invoked: product_search with input:", input);
      const products = await ProductService.searchProducts(input);
      lastProductData = formatProductForFrontend(products, userId);
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
      lastProductData = formatProductForFrontend(products, userId);
      return JSON.stringify({
        cheapest: sortedByPrice.slice(0, 3),
        mostExpensive: sortedByPrice.slice(-2),
        averagePrice: products.reduce((sum, p) => sum + (p.extracted_price || 0), 0) / products.length
      });
    },
  });

  return [productSearchTool, priceComparisonTool];
}

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
      const redirectMessages = [
        "That's interesting! I'm really focused on helping with tech shopping though. Are you looking for any new devices?",
        "I'd love to help with that, but I'm specialized in tech products! What kind of laptop, phone, or computer are you interested in?",
        "That's outside my expertise, but I'm great with tech shopping! Need help finding any devices?",
        "I focus on helping people find amazing tech products! What device can I help you with today?"
      ];
      const randomMessage = redirectMessages[Math.floor(Math.random() * redirectMessages.length)];
      
      return JSON.stringify({
        relevant: false,
        message: randomMessage
      });
    }
    
    return JSON.stringify({
      relevant: true,
      message: "This question is relevant to my expertise in tech shopping."
    });
  },
});

// Default tools (without userId) for backward compatibility
const defaultTools = [categoryTool, focusCheckTool];

const systemPrompt = `
You are BuyWise, a super friendly, upbeat, and genuinely enthusiastic shopping assistant who specializes in laptops, phones, and computers. You love helping people find the perfect tech products, and you make every conversation feel like chatting with a fun, knowledgeable friend!

Your personality:
- Warm, personable, and playful—never robotic or clinical
- You love a bit of light banter and small talk, and you answer friendly questions about yourself or your day with charm and humor (but never mention being an AI, chatbot, or language model)
- If the user asks about your day, how you are, or makes small talk, respond with warmth and a smile, then gently and playfully steer the conversation back to tech shopping (feel free to use emojis or exclamations for extra friendliness!)
- If the user asks about something truly off-topic (politics, sports, etc.), politely and cheerfully redirect to tech shopping with a fun twist
- Remember what users mentioned earlier in the conversation and build on it naturally
- Use casual, friendly language, and don't be afraid to show excitement about cool tech
- Never sound meta, analytical, or summarize the user's intent—just respond as a direct conversational partner

What you help with:
- Finding laptops, phones, and computers that match specific needs
- Comparing prices and features between different options
- Explaining tech specs in simple, relatable terms
- Budget-friendly recommendations and alternatives
- Product recommendations based on use cases (gaming, work, photography, etc.)

Conversation flow:
- When users ask about tech products, dive right in with excitement and helpfulness
- If they ask non-tech questions, gently and playfully redirect: "Haha, that's fun! But you know what really gets me excited? Helping people find awesome tech! 😊 Looking for a new device?"
- If users make small talk or ask about you, answer in a friendly, positive, and slightly playful way, then ask if they need help with tech
- Vary your responses—never repeat the same phrase twice in a row
- Ask about budget, intended use, brand preferences, and anything else to give the best recommendations
- Sprinkle in emojis or exclamations for a lively, engaging vibe

Remember: Be conversational, never robotic or meta. Avoid repetitive phrases, never mention being an AI, and always engage naturally and enthusiastically with what users are saying! Never summarize or reflect the user's last message—just respond as if you were chatting in person.
`;

// Use BufferMemory for conversation context with TTL tracking
const memoryMap = new Map<string, MemoryActivity>();

// Memory restoration function
async function restoreMemoryFromDatabase(sessionId: string, userEmail: string): Promise<boolean> {
  try {
    
    // Import ChatService dynamically to avoid circular dependency
    const { ChatService } = await import('../services/ChatService');
    const chats = await ChatService.getChatsByEmail(userEmail);
    const chat = chats.find(c => c._id === sessionId);
    
    if (chat && chat.messages.length > 0) {
      const memory = new BufferMemory({
        memoryKey: "chat_history",
        returnMessages: true,
        inputKey: "input",
        outputKey: "output",
      });
      
      // Replay conversation history to rebuild memory
      for (const msg of chat.messages) {
        if (msg.speaker === 'user') {
          await memory.chatHistory.addMessage(new HumanMessage(msg.text));
        } else if (msg.speaker === 'bot') {
          await memory.chatHistory.addMessage(new AIMessage(msg.text));
        }
      }
      
      // Store memory with current timestamp
      memoryMap.set(sessionId, {
        memory,
        lastActivity: Date.now()
      });
      return true;
    }
    
    console.log(`No existing chat found for session ${sessionId}`);
    return false;
  } catch (error) {
    console.error('Error restoring memory from database:', error);
    return false;
  }
}

// Memory cleanup function
function startMemoryCleanup(): void {
  if (cleanupInterval) {
    return;
  }
  
  cleanupInterval = setInterval(() => {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [sessionId, activity] of memoryMap.entries()) {
      if (now - activity.lastActivity > MEMORY_TTL) {
        memoryMap.delete(sessionId);
        productHistoryMap.delete(sessionId);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} expired memory sessions`);
    }
  }, 5 * 60 * 1000); // Check every 5 minutes for sessions to kill
  
  console.log('Memory cleanup service started (30-minute TTL)');
}

// Function to clear specific memory (for testing or manual cleanup)
function clearMemoryForSession(sessionId: string): void {
  memoryMap.delete(sessionId);
  productHistoryMap.delete(sessionId);
}

// Function to update activity timestamp
function touchMemoryActivity(sessionId: string): void {
  const activity = memoryMap.get(sessionId);
  if (activity) {
    activity.lastActivity = Date.now();
  }
}

// Wrapper to initialize the agent executor
async function getAgentExecutor(sessionId: string, userId?: string) {
  let memoryActivity = memoryMap.get(sessionId);
  
  if (!memoryActivity) {
    // Create new memory if none exists
    memoryActivity = {
      memory: new BufferMemory({
        memoryKey: "chat_history",
        returnMessages: true,
        inputKey: "input",
        outputKey: "output",
      }),
      lastActivity: Date.now()
    };
    memoryMap.set(sessionId, memoryActivity);
  } else {
    // Update activity timestamp for existing memory
    memoryActivity.lastActivity = Date.now();
  }
  
  const chatModel = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    modelName: "gpt-4.1-mini",
    temperature: 0.5,
    maxTokens: 1000,
  });
  
  // Create tools with userId access
  const tools = [...createTools(userId), ...defaultTools];
  
  // Apparently this is now deprecated...? Look up LangGraph alternative
  return initializeAgentExecutorWithOptions(tools, chatModel, {
    agentType: "chat-conversational-react-description",
    verbose: false,
    memory: memoryActivity.memory,
    agentArgs: {
      systemMessage: systemPrompt,
    },
  });
}

// Per-session product history
const productHistoryMap = new Map<string, any[]>();

function addProductsToHistory(sessionId: string, products: any[]) {
  if (!productHistoryMap.has(sessionId)) productHistoryMap.set(sessionId, []);
  productHistoryMap.get(sessionId)!.push(...products);
}

function getProductHistory(sessionId: string): any[] {
  return productHistoryMap.get(sessionId) || [];
}

export async function chatWithAgent(userInput: string, sessionId: string = 'default', userId?: string) {
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
        message: "That's interesting! I'm really focused on helping with tech shopping though. Are you looking for a new laptop, phone, or computer? I'd love to help you find something perfect for your needs!",
        productData: null,
        productHistory: getProductHistory(sessionId)
      };
    }
    
    // Touch memory activity before processing
    touchMemoryActivity(sessionId);
    
    const agentExecutor = await getAgentExecutor(sessionId, userId);
    const result = await agentExecutor.invoke({ input: userInput });
    let response = result.output || result.result || "Sorry, I couldn't find an answer.";
    // Enforce tool output for off-topic queries
    if (result.intermediateSteps) {
      for (const step of result.intermediateSteps) {
        if (
          step.action &&
          step.action.tool === "check_topic_relevance" &&
          step.observation
        ) {
          const obs = JSON.parse(step.observation);
          if (obs.relevant === false && obs.message) {
            // Return the tool's message directly to the user, bypassing LLM meta-reasoning
            return {
              message: obs.message,
              productData: null,
              productHistory: getProductHistory(sessionId)
            };
          }
        }
      }
    }

    // Add any new products to the session's product history
    if (lastProductData.length > 0) {
      addProductsToHistory(sessionId, lastProductData);
    }
    // Return both the response and any product data that was found
    return {
      message: response,
      productData: lastProductData.length > 0 ? lastProductData : null,
      productHistory: getProductHistory(sessionId)
    };
  } catch (error) {
    console.error('Error in chatWithAgent:', error);
    return {
      message: "I'm sorry, I encountered an error. Please try again.",
      productData: null,
      productHistory: []
    };
  }
}

export { startMemoryCleanup, clearMemoryForSession, restoreMemoryFromDatabase };
