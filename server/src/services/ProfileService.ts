import Profile, { IProfile } from '../models/Profile';
import { AppError } from '../utils/AppError';

export class ProfileService {
  // Create a new profile for a user
  static async createProfile(userId: string, profileData: Partial<IProfile>): Promise<IProfile> {
    try {
      console.log('Creating profile for userId:', userId);
      
      const profile = new Profile({
        userId,
        ...profileData
      });
      await profile.save();
      
      console.log('Profile created successfully for userId:', userId);
      return profile;
    } catch (error: any) {
      console.log('ProfileService createProfile error:', {
        message: error.message,
        code: error.code,
        name: error.name,
        keyPattern: error.keyPattern,
        keyValue: error.keyValue
      });
      
      if (error.code === 11000) {
        // Check if it's a userId duplicate or something else
        if (error.keyPattern && error.keyPattern.userId) {
          throw new AppError('Profile already exists for this user', 400);
        } else {
          console.error('Unexpected duplicate key error:', error.keyPattern);
          throw new AppError('Profile creation failed due to duplicate data', 400);
        }
      }
      
      // Handle validation errors
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map((err: any) => err.message);
        throw new AppError(validationErrors.join(', '), 400);
      }
      
      throw error;
    }
  }

  // Get profile by user ID
  static async getProfileByUserId(userId: string): Promise<IProfile> {
    const profile = await Profile.findOne({ userId });
    if (!profile) {
      throw new AppError('Profile not found', 404);
    }
    return profile;
  }

  // Get profile by ID
  static async getProfile(id: string): Promise<IProfile> {
    const profile = await Profile.findById(id);
    if (!profile) {
      throw new AppError('Profile not found', 404);
    }
    return profile;
  }

  // Update profile
  static async updateProfile(userId: string, updateData: Partial<IProfile>): Promise<IProfile> {
    const profile = await Profile.findOne({ userId });
    if (!profile) {
      throw new AppError('Profile not found', 404);
    }

    // Don't allow userId updates through this endpoint
    delete updateData.userId;

    Object.assign(profile, updateData);
    await profile.save();

    return profile;
  }

  // Update profile by ID
  static async updateProfileById(id: string, updateData: Partial<IProfile>): Promise<IProfile> {
    const profile = await Profile.findById(id);
    if (!profile) {
      throw new AppError('Profile not found', 404);
    }

    // Don't allow userId updates through this endpoint
    delete updateData.userId;

    Object.assign(profile, updateData);
    await profile.save();

    return profile;
  }

  // Create or update profile (upsert)
  static async createOrUpdateProfile(userId: string, profileData: Partial<IProfile>): Promise<IProfile> {
    try {
      const profile = await Profile.findOneAndUpdate(
        { userId },
        { ...profileData, userId },
        { new: true, upsert: true }
      );
      return profile;
    } catch (error: any) {
      throw new AppError('Failed to create or update profile', 400);
    }
  }
} 