import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { AppError } from '../utils/AppError';
import { CustomJwtPayload } from '../types/jwt';
import { Document } from 'mongoose';
import { UserService } from './UserService';
import { ProfileService } from './ProfileService';

export class AuthService {
  private static JWT_SECRET: Secret = process.env.JWT_SECRET || 'your-secret-key';
  private static JWT_EXPIRES_IN = '24h';

  /**
   * Registers a new user, auto-verifies them, creates a profile with default values, and returns a JWT token and user data.
   */
  static async register(name: string, email: string, password: string): Promise<{ token: string; user: Partial<IUser> }> {
    // Create user using UserService (user is auto-verified)
    const user = await UserService.createUser({ name, email, password });
    // At this point, the user is automatically verified and can login immediately

    // Create a default profile for the user with proper default values
    await ProfileService.createProfile((user as Document & { _id: any })._id.toString(), {
      
      storage_preference: 'none',
      RAM_preference: 'none',
      brand_preference: '',
      min_budget: 100,
      max_budget: 1000,
      rating_preference: 3,
      country: 'Canada'
    });

    // Generate JWT token
    const payload: CustomJwtPayload = {
      id: (user as Document & { _id: any })._id.toString()
    };

    const token = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN
    } as SignOptions);

    // Create user object without password
    const { password: _, ...userWithoutPassword } = user.toObject();

    return {
      token,
      user: userWithoutPassword
    };
  }

  static async login(email: string, password: string): Promise<{ token: string; user: Partial<IUser> }> {
    // Find user and include password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      throw new AppError('Please verify your email before logging in', 401);
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate JWT token
    const payload: CustomJwtPayload = {
      id: (user as Document & { _id: any })._id.toString()
    };

    const token = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN
    } as SignOptions);

    // Create user object without password
    const { password: _, ...userWithoutPassword } = user.toObject();

    return {
      token,
      user: userWithoutPassword
    };
  }
} 