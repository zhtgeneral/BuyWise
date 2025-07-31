import mongoose, { Schema, Document } from 'mongoose';

export interface IRecommendationCache extends Document {
  userId?: string;
  email?: string;
  type: string; // 'personalized', 'trending', 'default', 'category'
  category?: string;
  recommendations: any[];
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RecommendationCacheSchema: Schema = new Schema({
  userId: {
    type: String,
    required: false,
    index: true
  },
  email: {
    type: String,
    required: false,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['personalized', 'trending', 'default', 'category'],
    index: true
  },
  category: {
    type: String,
    required: false
  },
  recommendations: {
    type: Schema.Types.Mixed,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
RecommendationCacheSchema.index({ userId: 1, type: 1, expiresAt: 1 });
RecommendationCacheSchema.index({ email: 1, type: 1, expiresAt: 1 });

export default mongoose.model<IRecommendationCache>('RecommendationCache', RecommendationCacheSchema); 