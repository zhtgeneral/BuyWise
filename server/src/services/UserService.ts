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
  static async createUser(userData: { name: string; email: string; password: string }): Promise<Partial<IUser>> {
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
    const userWithoutPassword = await UserService.getUserByEmail(userData.email);
    return userWithoutPassword;
  }

  /**
   * Verfies the email of the user.
   * 
   * This assumes that the token exists for a user in the db.
   */
  static async verifyEmail(user: Partial<IUser>): Promise<void> {    
    user.isEmailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();
  }

  /**
   * This generates a verification token and resends email.
   * 
   * This assumes that the user exists in db.
   */
  static async resendVerificationEmail(user: Partial<IUser>): Promise<void> {
    const verificationToken = user.generateVerificationToken();
    
    await user.save();

    await sendVerificationEmail(user.email, verificationToken);
  }

  /**
   * This gets the user without the password by searching for valid token.
   */
  static async getUserByToken(token: string): Promise<Partial<IUser>> {
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }
    }).select('-password').exec();
    
    return user.toObject();
  }

  /**
   * Return user as json format for frontend
   */
  static async getUserById(id: string, showPassword = false): Promise<Partial<IUser>> {
    let user;
    if (showPassword) {
      user = await User.findById(id).select('+password');
    } else {
      user = await User.findById(id).select('-password');
    }  
    return user?.toObject();
  }

  /**
   * Return user as json format for frontend
   */
  static async getUserByEmail(email: string, showPassword = false): Promise<Partial<IUser>> {
    let user;
    if (showPassword) {
      user = await User.findOne({ email }).select('+password');
      return user;
    } else {
      user = await User.findOne({ email }).select('-password');
    }  
    return user?.toObject();
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

  /**
   * Assume user exists in database and currentPassword is correct.
   */
  static async updatePassword(user: Partial<IUser>, newPassword: string): Promise<void> {    
    user.password = newPassword;
    await user.save();
  }

  static async comparePassword(user: Partial<IUser>, currentPassword: string) {
    return await user.comparePassword(currentPassword);
  }

  static async deleteUser(email: string) {
    await User.deleteOne({ email });
  }
} 