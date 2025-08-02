import mongoose, { Schema, Document } from 'mongoose';

// TODO change this to use updated preference fields
// TODO Preferences are now 
// brand preference, min, max, rating, country, min storage, min RAM
// min storage is either: none, 128, 256, 512, 1TB+
// min RAM is either: none 2, 4, 8, 16, 32+

/**
 * This is the Profile type for the frontend. Make sure to call .toObject() before returning it to match this type.
 */
export interface IProfile extends Document {
  userId: string;
  name: string;
  country: string;
  max_products_per_search: number;
  price_sort_preference: string;
  allow_ai_personalization: boolean;
  response_style: string;
  minimum_rating_threshold: number;
  exclude_unrated_products: boolean;
  createdAt: string;
  updatedAt: string;
  email: string;
}

const ProfileSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    immutable: true  // Name cannot be changed after creation
  },
  country: {
    type: String,
    default: 'Vancouver, British Columbia, Canada'
  },
  max_products_per_search: {
    type: Number,
    default: 3,
    min: 1,
    max: 10
  },
  price_sort_preference: {
    type: String,
    default: 'lowest_first',
    enum: ['lowest_first', 'highest_first', 'none']
  },
  allow_ai_personalization: {
    type: Boolean,
    default: true
  },
  response_style: {
    type: String,
    default: 'conversational',
    enum: ['concise', 'conversational', 'technical']
  },
  minimum_rating_threshold: {
    type: Number,
    default: 3,
    min: 1,
    max: 5
  },
  exclude_unrated_products: {
    type: Boolean,
    default: false
  },
  email: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model<IProfile>('Profile', ProfileSchema); 