import Profile, { IProfile } from '../models/Profile';
import { sendVerificationEmail } from './EmailService'; 
import { AppError } from '../utils/AppError';

export class ProfileService {
  // Create a new profile
  static async createProfile(profileData: Partial<IProfile>): Promise<IProfile> {
    try {
      const profile = new Profile(profileData);
      const verificationToken = profile.generateVerificationToken();
      await profile.save();

      // Send verification email
      await sendVerificationEmail(profile.email, verificationToken);

      return profile;
    } catch (error: any) {
      if (error.code === 11000) {
        throw new AppError('Email already exists', 400);
      }
      throw error;
    }
  }

  // Verify email
  static async verifyEmail(token: string): Promise<void> {
    const profile = await Profile.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }
    });

    if (!profile) {
      throw new AppError('Invalid or expired verification token', 400);
    }

    profile.isEmailVerified = true;
    profile.verificationToken = undefined;
    profile.verificationTokenExpires = undefined;
    await profile.save();
  }

  // Resend verification email
  static async resendVerificationEmail(email: string): Promise<void> {
    const profile = await Profile.findOne({ email });
    if (!profile) {
      throw new AppError('Profile not found', 404);
    }

    if (profile.isEmailVerified) {
      throw new AppError('Email is already verified', 400);
    }

    const verificationToken = profile.generateVerificationToken();
    await profile.save();

    await sendVerificationEmail(email, verificationToken);
  }

  // Get profile
  static async getProfile(id: string): Promise<IProfile> {
    const profile = await Profile.findById(id).select('+password');
    if (!profile) {
      throw new AppError('Profile not found', 404);
    }
    return profile;
  }

  // Update profile
  static async updateProfile(id: string, updateData: Partial<IProfile>): Promise<IProfile> {
    const profile = await Profile.findById(id);
    if (!profile) {
      throw new AppError('Profile not found', 404);
    }

    // Don't allow email updates through this endpoint
    delete updateData.email;
    delete updateData.password;

    Object.assign(profile, updateData);
    await profile.save();

    return profile;
  }

  // Update password
  static async updatePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
    const profile = await Profile.findById(id).select('+password');
    if (!profile) {
      throw new AppError('Profile not found', 404);
    }

    const isPasswordValid = await profile.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    profile.password = newPassword;
    await profile.save();
  }
} 