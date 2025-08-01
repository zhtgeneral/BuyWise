import { profileEnd } from 'console';
import Profile, { IProfile } from '../models/Profile';
import { AppError } from '../utils/AppError';

export class ProfileService {
  /**
   * Assume user is already created. Assume that profile with userId doesn't already exist
   */
  static async createProfile(userId: string, profileData: Partial<IProfile>): Promise<IProfile> {
    try {      
      var profile = new Profile({
        userId: userId,
        ...profileData
      });
      await profile.save();
    } catch (error: any) {
      console.error('ProfileService createProfile error: ', JSON.stringify(error, null, 2));      
      throw error;
    }

    console.log('ProfileService::createProfile created profile: ', JSON.stringify(profile, null, 2));
    return profile;
  }

  // Get profile by user ID
  static async getProfileByUserId(userId: string): Promise<Partial<IProfile>> {
    const profile = await Profile.findOne({ userId });
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

  /**
   * Update profile.
   * Assume that the profile exists in db.
   */
  static async updateProfile(profile: Partial<IProfile>, updateData: Partial<IProfile>): Promise<Partial<IProfile>> {
    delete updateData.userId;
    delete updateData.name;
    const updatedProfile = await Profile.findOneAndUpdate(
        { _id: profile._id },
        { $set: updateData },
        { new: true }
    );
    return updatedProfile;
}

  // Update profile by ID
  static async updateProfileById(id: string, updateData: Partial<IProfile>): Promise<IProfile> {
    const profile = await Profile.findById(id);
    if (!profile) {
      throw new AppError('Profile not found', 404);
    }

    // Don't allow userId or name updates through this endpoint
    delete updateData.userId;
    delete updateData.name;

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

  static async deleteProfile(email: string): Promise<void> {
    await Profile.deleteOne({ email });
  }
} 