import { chatWithAgent, restoreMemoryFromDatabase } from '../agent/chatbotAgent';
import { ChatService } from './ChatService';

export interface ChatbotResponse {
  chatbotMessage: string;
  responseConversationId: string;
  productData: any[] | null;
}

export class ChatbotService {
  /**
   * Process a user message through the chatbot flow:
   * 1. Create/find conversation and save user message
   * 2. Get AI response using real MongoDB _id for memory consistency
   * 3. Save AI response to conversation
   * 4. Return response with conversation ID
   */
  static async processMessage(
    message: string,
    conversationId: string | null,
    userEmail: string,
    userId: string
  ): Promise<ChatbotResponse> {
    let sessionId = conversationId;
    
    //  Handle conversation creation/identification
    if (!conversationId) {
      // New conversation for user
      console.log('ChatbotService: Creating new conversation for user:', userEmail);
      const userMessage = {
        speaker: 'user' as const,
        text: message,
        timestamp: new Date().toISOString()
      };
      
      // Create new conversation with just the user message
      const savedChat = await ChatService.saveChat([userMessage], userEmail);
      sessionId = savedChat._id.toString();
      console.log('ChatbotService: Created new conversation with ID:', sessionId, 'for user:', userEmail);
    } else {
      // Existing conversation
      console.log('ChatbotService: Continuing existing conversation:', conversationId, 'for user:', userEmail);
      sessionId = conversationId;
      
      // Attempt to restore memory from database for existing conversations
      try {
        await restoreMemoryFromDatabase(sessionId, userEmail);
      } catch (error) {
        console.error('ChatbotService: Memory restoration failed, but continuing:', error);
      }
    }
    
    // Get AI response using the real MongoDB _id
    const agentResponse = await chatWithAgent(message, sessionId, userId, userEmail);
    
    // Update database with AI response
    await this.saveConversationExchange(
      message,
      agentResponse.message,
      agentResponse.productData || [],
      userEmail,
      conversationId,
      sessionId
    );
    
    return {
      chatbotMessage: agentResponse.message,
      responseConversationId: sessionId,
      productData: agentResponse.productData
    };
  }
  
  // Save the user message and AI response to the conversation
  private static async saveConversationExchange(
    userMessageText: string,
    aiMessageText: string,
    productData: any[],
    userEmail: string,
    originalConversationId: string | null,
    sessionId: string
  ): Promise<void> {
    // Prepare user and bot messages for this exchange
    const userMessage = {
      speaker: 'user' as const,
      text: userMessageText,
      timestamp: new Date().toISOString()
    };
    
    const botMessage = {
      speaker: 'bot' as const,
      text: aiMessageText,
      timestamp: new Date().toISOString(),
      recommendedProducts: productData
    };
    
    if (!originalConversationId) {
      // This was a new conversation - add the AI response to existing user message
      console.log('Adding AI response to new conversation:', sessionId);
      const existingChats = await ChatService.getChatsByEmail(userEmail);
      const currentChat = existingChats.find(chat => chat._id === sessionId);
      
      if (currentChat) {
        console.log('Found current chat with', currentChat.messages.length, 'messages');
        const updatedMessages = [...currentChat.messages, botMessage] as any[];
        await ChatService.saveChat(updatedMessages, userEmail, sessionId.toString());
        console.log('Successfully added AI response to new conversation:', sessionId);
      } else {
        console.error('Could not find current chat with sessionId:', sessionId);
        console.error('Available chat IDs:', existingChats.map(c => c._id));
      }
    } else {
      // Update existing conversation with both messages
      const existingChats = await ChatService.getChatsByEmail(userEmail);
      const currentChat = existingChats.find(chat => chat._id === originalConversationId);
      
      if (currentChat) {
        const updatedMessages = [...currentChat.messages, userMessage, botMessage] as any[];
        await ChatService.saveChat(updatedMessages, userEmail, originalConversationId.toString());
        console.log('Updated existing conversation:', originalConversationId);
      }
    }
  }
}
