import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  ageRange: {
    type: String,
    enum: ['18-24', '25-34', '35-44', '45-54', '55+'],
  },
  preferences: {
    interests: [String],
    brandPreferences: [String],
    apparelSizes: {
      type: Map,
      of: String,
    },
  },
  searchHistory: [{
    query: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
    results: [{
      platform: String,
      productId: String,
      title: String,
      price: Number,
      url: String,
    }],
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const User = mongoose.models.User || mongoose.model('User', userSchema); 