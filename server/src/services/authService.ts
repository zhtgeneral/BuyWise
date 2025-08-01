import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { CustomJwtPayload } from '../types/jwt';
import { Document } from 'mongoose';
import { UserService } from './UserService';
import { ProfileService } from './ProfileService';
import { AppError } from '../utils/AppError';

interface AuthData {
  token: string,
  user: Partial<IUser>
}

export class AuthService {

  private static JWT_SECRET: Secret = process.env.JWT_SECRET || 'your-secret-key';
  private static JWT_EXPIRES_IN = '24h';

  /**
   * Creates an autoverified user and creates a profile with default values
   * 
   * The user returned does not contain password and is a JSON.
   * 
   * Assume that email doesn't already exist in db.
   */
  static async register(name: string, email: string, passwordData: string): Promise<AuthData> {
    const user = await UserService.createUser({ name, email, password: passwordData });
    
    const userId = (user as any)._id;
    const profileData = {      
      name: name,
      country: 'Canada',
      max_products_per_search: 5,
      price_sort_preference: 'lowest_first',
      allow_ai_personalization: true,
      response_style: 'conversational',
      minimum_rating_threshold: 3,
      exclude_unrated_products: false,
      email: user.email
    }
    const profile = await ProfileService.createProfile(userId, profileData);

    const payload: CustomJwtPayload = {
      id: (user as Document & { _id: any })._id.toString()
    };
    console.log();
    
    const token = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN
    } as SignOptions);
    console.log("token", token);
    
    return {
      token: token,
      user: user
    };
  }

  /**
   * Logs the user in.
   * 
   * Assumes the user exist in db.
   * 
   * Validate the user before calling this function in the endpoint.
   */
  static async login(user: Partial<IUser>, password: string): Promise<AuthData> {
    const isPasswordValid = await UserService.comparePassword(user, password);
    if (!isPasswordValid) {
      throw new AppError('Invalid password', 401);
    }

    const payload: CustomJwtPayload = {
      id: (user as Document & { _id: any })._id.toString()
    };

    const token = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN
    } as SignOptions);

    const userWithoutPassword = await UserService.getUserByEmail(user.email, false);

    return {
      token: token,
      user: userWithoutPassword
    };
  }

  /**
   * Only call for cleaning up tests
   */
  static async delete(email: string): Promise<void> {
    await Promise.all([
      UserService.deleteUser(email),
      ProfileService.deleteProfile(email)
    ])
  }
} 