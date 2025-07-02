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
  storage_preference: string;
  RAM_preference: string;
  brand_preference: string; // use Comma seperated string instead of array for less storage use
  min_budget: number,
  max_budget: number,
  rating_preference: number,
  country: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
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
  storage_preference: {
    type: String,
    required: false,
    enum: ['none', '64GB', '128GB', '256GB', '512GB', '1TB+']
  },
  RAM_preference: {
    type: String,
    required: false,
    enum: ['none', '2GB', '4GB', '8GB', '16GB', '32GB+']
  },
  brand_preference: {
    type: String,
    required: false,
  },
  min_budget: {
    type: Number,
    required: false,
    default: 100
  },
  max_budget: {
    type: Number,
    required: false,
    default: 1000
  },
  rating_preference: {
    type: Number,
    default: 3
  },
  country: {
    type: String,
    default: 'Canada'
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  email: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model<IProfile>('Profile', ProfileSchema); 