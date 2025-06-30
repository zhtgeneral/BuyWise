import mongoose from 'mongoose';

export interface IMessage {
  speaker: string,
  text: string,
  timestamp?: string
}
export interface IChat {
  messages: IMessage[],
  email: string,
  createdAt?: string
}

const MessageSchema = new mongoose.Schema({
  speaker: {
    type: String,
    enum: ['user', 'bot'],
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const ChatSchema = new mongoose.Schema({
  messages: [MessageSchema],
  email: {
    type: String,
    required: true,
    index: true, // Optional: makes queries by email faster
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Chat', ChatSchema);