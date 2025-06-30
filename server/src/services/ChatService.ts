import Chat, { IChat, IMessage } from '../models/Chat';
import { AppError } from '../utils/AppError';

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
      createdAt: new Date().toISOString()
    });
    await chat.save();
    const obj = chat.toObject()
    return {
      email: obj.email,
      createdAt: obj.createdAt.toISOString(),
      messages: obj.messages.map((m: any) => ({
        speaker: m.speaker,
        text: m.text,
        timestamp: m.timestamp?.toISOString()
      }))
    };
  }

  // Get all chats for a specific user by email
  static async getChatsByEmail(email: string) {
    if (!email) {
      throw new AppError('email is required', 400);
    }
    const chats = await Chat.find({ email });
    return chats;
  }
}
