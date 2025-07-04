import mongoose from 'mongoose';

export interface IRecommendedProduct {
  id: string;
  source: string;
  title: string;
  image: string;
  price: number;
  url: string;
  rating?: number;
  reviews?: number;
}

export interface IMessage {
  speaker: string,
  text: string,
  timestamp?: string;  
  recommendedProducts?: IRecommendedProduct[]
}

export interface IChat {
  _id: string;
  messages: Partial<IMessage>[],
  email: string,
  createdAt?: string; 
}

const RecommendedProductSchema = new mongoose.Schema({
  id: { type: String, required: true },
  source: { type: String },
  title: { type: String },
  image: { type: String },
  price: { type: Number },
  url: { type: String },
  rating: { type: Number },
  reviews: { type: Number }
}, { _id: false });

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
  recommendedProducts: [RecommendedProductSchema]
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
    index: true, // Index for time-based deduplication queries
  }
});

// Compound index for efficient deduplication queries
ChatSchema.index({ email: 1, createdAt: -1 });

export default mongoose.model('Chat', ChatSchema);