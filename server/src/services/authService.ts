import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import Profile, { IProfile } from '../models/Profile';
import { AppError } from '../utils/AppError';
import { CustomJwtPayload } from '../types/jwt';
import { Document } from 'mongoose';

export class AuthService {
  private static JWT_SECRET: Secret = process.env.JWT_SECRET || 'your-secret-key';
  private static JWT_EXPIRES_IN = '24h';

  static async login(email: string, password: string): Promise<{ token: string; profile: Partial<IProfile> }> {
    // Find profile and include password
    const profile = await Profile.findOne({ email }).select('+password');
    if (!profile) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check if email is verified
    if (!profile.isEmailVerified) {
      throw new AppError('Please verify your email before logging in', 401);
    }

    // Verify password
    const isPasswordValid = await profile.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate JWT token
    const payload: CustomJwtPayload = {
      id: (profile as Document & { _id: any })._id.toString()
    };

    const token = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN
    } as SignOptions);

    // Create profile object without password
    const { password: _, ...profileWithoutPassword } = profile.toObject();

    return {
      token,
      profile: profileWithoutPassword
    };
  }
} 