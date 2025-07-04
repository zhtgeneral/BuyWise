import Chat, { IChat, IMessage } from '../models/Chat';

export class ChatService {
  /**
   * Save a new chat.
   * 
   * Assume that messages and email are valid.
   */
  static async saveChat(messages: IMessage[], email: string): Promise<IChat> {
    const chat = new Chat({ 
      messages: messages,
      email: email,
    });
    await chat.save();
    const obj = chat.toObject();
    return {
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
