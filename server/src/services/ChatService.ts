import Chat, { IChat, IMessage } from '../models/Chat';

export class ChatService {
  /**
   * Save a new chat with deduplication support.
   * 
   * Assume that messages and email are valid.
   * sessionId is used to prevent duplicate saves of the same conversation.
   */
  static async saveChat(messages: IMessage[], email: string, sessionId?: string): Promise<any> {
    // If sessionId is provided and starts with existing chat ID, check for existing chat
    if (sessionId && !sessionId.startsWith('temp-')) {
      const existingChat = await Chat.findById(sessionId);
      if (existingChat) {
        // Update existing chat instead of creating duplicate
        existingChat.messages = messages as any;
        await existingChat.save();
        
        const obj = existingChat.toObject();
        return {
          _id: obj._id,
          email: obj.email,
          createdAt: obj.createdAt.toISOString(),
          messages: obj.messages.map((m: any) => ({
            speaker: m.speaker,
            text: m.text,
            timestamp: m.timestamp?.toISOString(),
            recommendedProducts: (m.recommendedProducts || []).map((p: any) => ({
              id: p.id,
              source: p.source,
              title: p.title,
              image: p.image,
              price: p.price,
              url: p.url,
              rating: p.rating,
              reviews: p.reviews
            }))
          }))
        };
      }
    }
    
    // Check for recent duplicates (same email, similar message count, within last 5 minutes)
    if (messages.length > 1) {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const recentChats = await Chat.find({
        email: email,
        createdAt: { $gte: fiveMinutesAgo },
        'messages': { $size: messages.length }
      }).limit(5);
      
      // Check if any recent chat has identical last message
      const lastMessage = messages[messages.length - 1];
      for (const recentChat of recentChats) {
        const recentMessages = recentChat.messages;
        if (recentMessages && recentMessages.length > 0) {
          const recentLastMessage = recentMessages[recentMessages.length - 1];
          if (recentLastMessage && 
              recentLastMessage.text === lastMessage.text && 
              recentLastMessage.speaker === lastMessage.speaker) {
            console.log('Duplicate chat detected, skipping save');
            
            const obj = recentChat.toObject();
            return {
              _id: obj._id,
              email: obj.email,
              createdAt: obj.createdAt.toISOString(),
              messages: obj.messages.map((m: any) => ({
                speaker: m.speaker,
                text: m.text,
                timestamp: m.timestamp?.toISOString(),
                recommendedProducts: (m.recommendedProducts || []).map((p: any) => ({
                  id: p.id,
                  source: p.source,
                  title: p.title,
                  image: p.image,
                  price: p.price,
                  url: p.url,
                  rating: p.rating,
                  reviews: p.reviews
                }))
              }))
            };
          }
        }
      }
    }
    
    const chat = new Chat({ 
      messages: messages,
      email: email,
    });
    await chat.save();
    const obj = chat.toObject();
    return {
      _id: obj._id,
      email: obj.email,
      createdAt: obj.createdAt.toISOString(),
      messages: obj.messages.map((m: any) => ({
        speaker: m.speaker,
        text: m.text,
        timestamp: m.timestamp,
        recommendedProducts: (m.recommendedProducts || []).map((p: any) => ({
          id: p.id,
          source: p.source,
          title: p.title,
          image: p.image,
          price: p.price,
          url: p.url,
          rating: p.rating,
          reviews: p.reviews
        }))
      }))
    };
  }

  /**
   * Get all chats for a specific user by email
   */
  static async getChatsByEmail(email: string): Promise<IChat[]> {
    const chats = await Chat.find({ email: email });
    return chats.map(c => ChatService.formatChat(c.toObject()));
  }

  static formatChat(chat): IChat {
    return {
      _id: chat._id.toString(),
      email: chat.email as string,
      createdAt: chat.createdAt.toISOString() as string, // assumes Date object
      messages: chat.messages.map((m: any) => ({
        speaker: m.speaker,
        text: m.text,
        timestamp: new Date(m.timestamp).toISOString(), // force conversion
        recommendedProducts: m.recommendedProducts?.map((p: any) => ({
          id: p.id,
          source: p.source,
          title: p.title,
          image: p.image,
          price: p.price,
          url: p.url,
          rating: p.rating,
          reviews: p.reviews
        }))
      })) as IMessage[]
    };
  }
}
