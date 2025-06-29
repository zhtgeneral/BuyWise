import User, { IUser } from '../models/User';
import { sendVerificationEmail } from './EmailService'; 
import { AppError } from '../utils/AppError';

export class UserService {
  /**
   * Assume email doesn't already exist in db.
   * 
   * Create and return a user in db. The returned user does not contain the password and is a JSON.
   * 
   * The user is auto verified.
   */
  static async createUser(userData: { name: string; email: string; password: string }): Promise<IUser> {
    try {      
      var createdUser = new User(userData);
      createdUser.isEmailVerified = true;      
    } catch (error: any) {
      console.error("UserService::createUser error in creating user: " + JSON.stringify(error, null, 2));                
      throw error;
    }

    try {
      await createdUser.save();
    } catch (error: any) {
      console.error("UserService::createUser error encrypting password: " + JSON.stringify(error, null, 2));
      throw error;
    }

    console.log('UserService::createUser User created successfully:', createdUser.email);
    const userWithoutPassword = await User.findById(createdUser._id).select('-password');
    return userWithoutPassword.toObject();
  }

  // Verify email
  static async verifyEmail(token: string): Promise<void> {
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new AppError('Invalid or expired verification token', 400);
    }

    user.isEmailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();
  }

  // Resend verification email
  static async resendVerificationEmail(email: string): Promise<void> {
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.isEmailVerified) {
      throw new AppError('Email is already verified', 400);
    }

    const verificationToken = user.generateVerificationToken();
    await user.save();

    await sendVerificationEmail(email, verificationToken);
  }

  // Get user by ID
  static async getUserById(id: string): Promise<IUser> {
    const user = await User.findById(id).select('+password');
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  // Get user by email
  static async getUserByEmail(email: string): Promise<IUser> {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  // Update user
  static async updateUser(id: string, updateData: Partial<IUser>): Promise<IUser> {
    const user = await User.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Don't allow email updates through this endpoint
    delete updateData.email;
    delete updateData.password;

    Object.assign(user, updateData);
    await user.save();

    return user;
  }

  // Update password
  static async updatePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await User.findById(id).select('+password');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    user.password = newPassword;
    await user.save();
  }
} 