import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { CustomJwtPayload } from '../types/jwt';
import { Document } from 'mongoose';
import { UserService } from './UserService';
import { ProfileService } from './ProfileService';

interface RegisterData {
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
  static async register(name: string, email: string, passwordData: string): Promise<RegisterData> {
    const user = await UserService.createUser({ name, email, password: passwordData });

    await ProfileService.createProfile(
      (user as Document & { _id: any })._id.toString(), 
      {      
        storage_preference: 'none',
        RAM_preference: 'none',
        brand_preference: '',
        min_budget: 100,
        max_budget: 1000,
        rating_preference: 3,
        country: 'Canada'
      }
    );

    const payload: CustomJwtPayload = {
      id: (user as Document & { _id: any })._id.toString()
    };

    const token = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN
    } as SignOptions);

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
  static async login(user: IUser): Promise<{ token: string; user: Partial<IUser> }> {    
    const payload: CustomJwtPayload = {
      id: (user as Document & { _id: any })._id.toString()
    };

    const token = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN
    } as SignOptions);

    const { 
      password: _, 
      ...userWithoutPassword 
    } = user.toObject();

    return {
      token: token,
      user: userWithoutPassword
    };
  }
} 