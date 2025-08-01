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

function formatProductForFrontend(products: any[], userId?: string) {
  const formattedProducts = products.map((p) => {
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

// Helper function to filter products using LLM based on search history
async function filterProductsWithLLM(products: any[], searchHistory: string[], maxProducts: number): Promise<any[]> {
  if (products.length <= maxProducts) {
    return products; // No need to filter if we have fewer products than the limit
  }
  
  try {
    const prompt = `
    Based on this user's search history: ${searchHistory.join(', ')}
    
    From these ${products.length} products, select the ${maxProducts} best matches that align with their search patterns and preferences.
    
    Products:
    ${products.map((p, i) => `${i + 1}. ${p.title} - $${p.price} - Rating: ${p.rating} - ${p.source}`).join('\n')}
    
    Consider:
    - Brand preferences shown in search history
    - Price range patterns from past searches
    - Use case patterns (gaming, work, budget, etc.)
    - Feature priorities indicated by search terms
    
    Return only the numbers (1-${products.length}) of the ${maxProducts} best products as a JSON array.
    Example: [1, 5, 8]
    `;
    
    const model = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      modelName: "gpt-4.1-mini",
      temperature: 0.1,
      maxTokens: 100,
    });
    
    const result = await model.invoke(prompt);
    const selectedIndices = JSON.parse(result.content as string);
    
    if (Array.isArray(selectedIndices) && selectedIndices.every(i => i >= 1 && i <= products.length)) {
      // Convert 1-based indices to 0-based and filter products
      const filteredProducts = selectedIndices.map(i => products[i - 1]);
      console.log(`Smart filtering applied. Original: ${products.length}, Filtered: ${filteredProducts.length}`);
      return filteredProducts;
    } else {
      console.warn('Smart filtering returned invalid indices, using first N products');
      return products.slice(0, maxProducts);
    }
  } catch (error) {
    console.error('Error in smart filtering:', error);
    // Fallback to simple truncation if LLM filtering fails
    return products.slice(0, maxProducts);
  }
}

// Function to create tools with access to userId and sessionId
function createTools(userId: string, sessionId: string, userEmail: string, userProfile: any) {
  // Product search tool with smart filtering based on search history
  const productSearchTool = new DynamicTool({
    name: "product_search",
    description: "Search for laptops, phones, or computers using a product query string. Returns personalized results based on search history.",
    func: async (input: string) => {
      console.log("Tool Invoked: product_search with input:", input);
      
      // Get products from the search service
      const products = await ProductService.searchProducts(input, 'mobile', userProfile.country);
      let formattedProducts = formatProductForFrontend(products, userId);
      
      // Apply minimum rating filter if set
      if (userProfile.minimum_rating_threshold && userProfile.minimum_rating_threshold > 0) {
        formattedProducts = formattedProducts.filter(p => p.rating >= userProfile.minimum_rating_threshold);
      }
      
      // Filter out unrated products if preference is set
      if (userProfile.exclude_unrated_products) {
        formattedProducts = formattedProducts.filter(p => p.rating > 0);
      }
      
      // Apply price sorting if preference is set
      if (userProfile.price_sort_preference === 'lowest_first') {
        formattedProducts.sort((a, b) => a.price - b.price);
      } else if (userProfile.price_sort_preference === 'highest_first') {
        formattedProducts.sort((a, b) => b.price - a.price);
      }
      
      const maxProducts = userProfile.max_products_per_search || 3;
      
      // Get user's search history and apply smart filtering if personalization is enabled
      if (userProfile.allow_ai_personalization) {
        try {
          const { SearchHistoryService } = await import('../services/SearchHistoryService');
          const searchHistory = await SearchHistoryService.getSearchHistory(userId);
          
          // Add current search to history
          await SearchHistoryService.addSearchTerm(userId, input);
          
          // Apply smart filtering if we have search history
          if (searchHistory.length > 0) {
            formattedProducts = await filterProductsWithLLM(formattedProducts, searchHistory, maxProducts);
          } else {
            // No search history yet, just take first N products
            formattedProducts = formattedProducts.slice(0, maxProducts);
          }
        } catch (error) {
          console.error('Error managing search history:', error);
          // Fallback to simple truncation
          formattedProducts = formattedProducts.slice(0, maxProducts);
        }
      } else {
        // No personalization - just return first N products
        formattedProducts = formattedProducts.slice(0, maxProducts);
      }
      
      return JSON.stringify(formattedProducts);
    },
  });

  // Session product history tool
  const sessionProductHistoryTool = new DynamicTool({
    name: "session_product_history",
    description: "Get all products that have been discussed in this conversation session. Use this when the user asks about products from earlier in the conversation, wants to compare with previous products, or references 'the laptop we looked at before' etc.",
    func: async (input: string) => {
      console.log("Tool Invoked: session_product_history with input:", input);

      try {
        // Import ChatService dynamically to avoid circular dependency
        const { ChatService } = await import('../services/ChatService');
        const existingChats = await ChatService.getChatsByEmail(userEmail);
        const currentChat = existingChats.find(chat => chat._id === sessionId);
        
        if (currentChat && currentChat.messages.length > 0) {
          // Extract all products from bot messages in this conversation
          const sessionProducts = currentChat.messages
            .filter(m => m.speaker === 'bot' && m.recommendedProducts && m.recommendedProducts.length > 0)
            .flatMap(m => m.recommendedProducts || []);
          
          if (sessionProducts.length === 0) {
            return JSON.stringify({ products: [], message: "No products have been discussed in this conversation yet." });
          }
          
          // Return the most recent products (last 10 to avoid token limit)
          const recentProducts = sessionProducts.slice(-10);
          return JSON.stringify({ 
            products: recentProducts,
            total_count: sessionProducts.length,
            message: `Found ${sessionProducts.length} products from this conversation.`
          });
        }
        
        return JSON.stringify({ products: [], message: "No conversation history found." });
      } catch (error) {
        console.error('Error getting session product history:', error);
        return JSON.stringify({ products: [], message: "Error retrieving product history." });
      }
    },
  });

  return [productSearchTool, sessionProductHistoryTool];
}

// Drill down on product categories tool
const categoryTool = new DynamicTool({
  name: "category_insights",
  description: "Get insights about product categories and recommendations",
  func: async (input: string) => {
    console.log("Tool Invoked: category_insights with input:", input);

    // Maybe beef this up a bit with more categories
    const categories = {
      laptop: [
        'productivity',
        'gaming',
        'ultrabook',
        'business',
        'student',
        'creative/professional',
        'convertible/2-in-1',
        'rugged',
        'workstation',
        'budget'
      ],
      phone: [
        'budget',
        'flagship',
        'camera-focused',
        'gaming',
        'foldable',
        'compact',
        'battery-life',
        'rugged',
        'business',
        'mid-range'
      ],
      computer: [
        'desktop',
        'workstation',
        'gaming-pc',
        'mini-pc',
        'all-in-one',
        'home-theater',
        'server',
        'compact',
        'enthusiast',
        'budget'
      ]
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
You are BuyWise, a shopping assistant who specializes in laptops, phones, and computers. You help people find the perfect tech products.

What you help with:
- Finding laptops, phones, and computers that match specific needs
- Comparing prices and features between different options
- Explaining tech specs in simple, relatable terms
- Budget-friendly recommendations and alternatives
- Product recommendations based on use cases (gaming, work, photography, etc.)
- Referencing and comparing products from earlier in the conversation

Core guidelines:
- When users ask about tech products, focus on being helpful and informative
- If they ask non-tech questions, politely redirect to tech shopping
- Ask about budget, intended use, brand preferences, and anything else to give the best recommendations
- Remember what users mentioned earlier in the conversation and build on it naturally
- Never mention being an AI, chatbot, or language model
- Never sound meta, analytical, or summarize the user's intent—just respond as a direct conversational partner

Product Recommendations:
- When you use the product_search tool, it will return products that are already filtered and personalized based on the user's preferences and search history
- Present all the returned products naturally in your response - they're already the right ones for the user
- Focus on explaining why these products are good matches for their needs
- If personalization is enabled, you can reference how the recommendations align with their interests
`;

// Function to create personalized system prompt based on user profile
function createPersonalizedSystemPrompt(userProfile: any): string {
  let personalizedSection = "";
  
  const name = `${userProfile.name}`;
  const preferences = [];
  
  // Handle response style - this controls the chatbot's personality and communication style
  if (userProfile.response_style) {
    const styleMap = {
      "concise": `
      Communication Style:
      - Keep responses brief, direct, and to the point
      - Focus on essential information and key recommendations
      - Use bullet points and structured format when helpful
      - Avoid excessive pleasantries or casual conversation
      - Be professional and efficient in your interactions`
      ,
      "conversational": `
      Communication Style:
      - Be warm, friendly, and genuinely enthusiastic about helping with tech shopping
      - Love a bit of light banter and small talk - answer friendly questions about yourself or your day with charm and humor
      - When users ask about your day or make small talk, respond with warmth and then gently steer back to tech shopping
      - Use casual, friendly language and don't be afraid to show excitement about cool tech
      - Make every conversation feel like chatting with a fun, knowledgeable friend
      - Feel free to use emojis or exclamations for extra friendliness
      - Be playful and personable - never robotic or clinical`
      ,
      "technical": `
      Communication Style:
      - Include detailed technical specifications and comparisons in your responses
      - Explain technical concepts thoroughly and accurately
      - Provide specific model numbers, chipset details, and performance metrics when relevant
      - Compare technical aspects like processors, RAM, storage types, display specs, etc.
      - Use precise technical terminology while still being accessible
      - Focus on the technical rationale behind recommendations`
    };
    preferences.push(styleMap[userProfile.response_style]);
  }
  
  // Handle AI personalization preference
  if (userProfile.allow_ai_personalization) {
    preferences.push(`
    Personalization Instructions:
    - Remember what the user has told you about their needs, budget, and preferences
    - Reference their past conversations and product interests
    - Proactively suggest products based on what you know about them
    - Ask follow-up questions that build on their history
    - Make connections between current requests and past interests
    `);
  } else {
    preferences.push(`
    Privacy Mode:
    - Treat each conversation independently
    - Don't reference past interactions or build user profiles
    - Provide generic, non-personalized recommendations
    - Don't store or use personal preference data
    `);
  }
  
  personalizedSection = `\n\nUser Information: You are helping a user named ${name}.
  ${preferences.join('\n')}`;
  
  return systemPrompt + personalizedSection;
}

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
}

// Function to update activity timestamp
function touchMemoryActivity(sessionId: string): void {
  const activity = memoryMap.get(sessionId);
  if (activity) {
    activity.lastActivity = Date.now();
  }
}

// Wrapper to initialize the agent executor
async function getAgentExecutor(sessionId: string, userId: string, userEmail: string) {
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
  
  // Fetch user profile for personalization
  const { ProfileService } = await import('../services/ProfileService');
  const userProfile = await ProfileService.getProfileByUserId(userId);
  
  // Create personalized system prompt
  const personalizedPrompt = createPersonalizedSystemPrompt(userProfile);
  
  const chatModel = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    modelName: "gpt-4.1-mini",
    temperature: 0.5,
    maxTokens: 1000,
  });
  
  // Create tools with userId, session context, and profile
  const tools = [...createTools(userId, sessionId, userEmail, userProfile), ...defaultTools];
  
  // Apparently this is now deprecated...? Look up LangGraph alternative
  return initializeAgentExecutorWithOptions(tools, chatModel, {
    agentType: "chat-conversational-react-description",
    verbose: false,
    returnIntermediateSteps: true,
    memory: memoryActivity.memory,
    agentArgs: {
      systemMessage: personalizedPrompt,
    },
  });
}

export async function chatWithAgent(userInput: string, sessionId: string = 'default', userId: string, userEmail: string) {
  try {
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
        productData: null
      };
    }
    
    // Touch memory activity before processing
    touchMemoryActivity(sessionId);
    
    const agentExecutor = await getAgentExecutor(sessionId, userId, userEmail);
    const result = await agentExecutor.invoke({ input: userInput });
    let response = result.output || result.result || "Sorry, I couldn't find an answer.";
    let productData: any[] | null = null;
    
    // Process tool execution results
    if (result.intermediateSteps) {
      console.log("Processing intermediate steps for tools...");
      for (const step of result.intermediateSteps) {
        console.log("Processing step:", step);
        if (step.action && step.observation) {
          const { tool } = step.action;
          
          // Handle topic relevance check
          if (tool === "check_topic_relevance") {
            try {
              const obs = JSON.parse(step.observation);
              if (obs.relevant === false && obs.message) {
                // Return the tool's message directly to the user, bypassing LLM meta-reasoning
                return {
                  message: obs.message,
                  productData: null
                };
              }
            } catch (error) {
              console.error('Error parsing topic relevance result:', error);
            }
          }
          
          // Extract product data from product search
          if (tool === "product_search") {
            try {
              productData = JSON.parse(step.observation);
            } catch (error) {
              console.error('Error parsing product search results:', error);
            }
          }
        }
      }
    }

    // Return both the response and any product data that was found
    return {
      message: response,
      productData: productData
    };
  } catch (error) {
    console.error('Error in chatWithAgent:', error);
    return {
      message: "I'm sorry, I encountered an error. Please try again.",
      productData: null
    };
  }
}

export { startMemoryCleanup, clearMemoryForSession, restoreMemoryFromDatabase };
