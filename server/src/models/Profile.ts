import mongoose, { Schema, Document } from 'mongoose';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// TODO change this to use updated preference fields
// TODO Preferences are now 
// brand preference, min, max, rating, country, min storage, min RAM
// min storage is either: none, 128, 256, 512, 1TB+
// min RAM is either: none 2, 4, 8, 16, 32+

export interface IProfile extends Document {
  name: string;
  storage_preference: string;
  RAM_preference: string;
  brand_preference: string; // use Comma seperated string instead of array for less storage use
  min_budget: number,
  max_budget: number
  email: string;
  password: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  isEmailVerified: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  generateVerificationToken(): string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const ProfileSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  storage_preference: {
    type: String,
    required: true,
    enum: ['none', '128GB', '256GB', '512GB', '1TB+']
  },
  RAM_preference: {
    type: String,
    required: true,
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
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Don't include password in queries by default
  },  
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationTokenExpires: Date
}, {
  timestamps: true
});

// Hash password before saving
ProfileSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password as string, salt);
    this.password = hashedPassword;
    next();
  } catch (error: any) {
    next(error);
  }
});

// Generate verification token
ProfileSchema.methods.generateVerificationToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  this.verificationToken = token;
  this.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  return token;
};

// Compare password method
ProfileSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

export default mongoose.model<IProfile>('Profile', ProfileSchema); 