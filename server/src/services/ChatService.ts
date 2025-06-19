import Chat from '../models/Chat';
import { AppError } from '../utils/AppError';

export class ChatService {
  // Save a new chat
  static async saveChat(messages: any[], email: string) {
    if (!messages || !email) {
      throw new AppError('messages and email are required', 400);
    }
    const chat = new Chat({ messages, email, createdAt: new Date() });
    await chat.save();
    return chat;
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
