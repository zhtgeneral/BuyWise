import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError';
import { CustomJwtPayload } from '../types/jwt';
import User from '../models/User';
import connectDB from '../lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JwtPayload {
  id: string;
  email?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log("No auth token recieved in header");
    return res.status(401).json({
      success: false,
      error: 'No auth token in header'
    })
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  if (!process.env.JWT_SECRET) {
    console.log("JWT secret not figured in env");
    return res.status(500).json({
      success: false,
      error: 'JWT not configured'
    })
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
    
    // Fetch user from database to get email
    await connectDB();
    const user = await User.findById(decoded.id).select('email');
    
    if (user) {
      req.user = {
        id: decoded.id,
        email: user.email
      };
    } else {
      req.user = decoded; // Fallback to just id if user not found
    }
    
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      console.log("JWT validation failed");
      return res.status(401).json({
        success: false,
        error: 'Invalid JWT'
      })
    } else {
      console.log("Unknown error during auth");
      return res.status(500).json({
        success: false,
        error: 'Unknown error'
      })
    }
  }
}; 

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // Skip auth for login/register routes
  if (req.path.startsWith('/api/auth')) {
    return next();
  }
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as CustomJwtPayload;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}