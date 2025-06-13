import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import profileRoutes from './routes/profile';
import authRoutes from './routes/auth';
import { CustomJwtPayload } from './types/jwt';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
const test_products = require('../static/products.json');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/BuyWise';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Log MongoDB URI (without password)
console.log('MongoDB URI:', MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@'));

// Middleware
app.use(cors());
app.use(express.json());

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // Skip auth for login/register routes
  if (req.path.startsWith('/api/auth')) {
    return next();
  }
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as CustomJwtPayload;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Connect to MongoDB with proper options
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      dbName: 'BuyWise',
      maxPoolSize: 10,
      minPoolSize: 5,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000,
      heartbeatFrequencyMS: 10000,
      retryWrites: true,
      retryReads: true
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log('Connection state:', mongoose.connection.readyState);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

    // Handle process termination
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
      } catch (err) {
        console.error('Error during MongoDB disconnection:', err);
        process.exit(1);
      }
    });

  } catch (error: any) {
    console.error('MongoDB connection error details:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
};

// Connect to database before starting the server
connectDB().then(() => {
  // Routes
  app.use('/api/profiles', profileRoutes);
  app.use('/api/auth', authRoutes);

  // Public route (no auth)
  app.get('/api/auth/hello', (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: 'Hello from public route!'
    });
  });

  // Protected route (requires JWT)
  app.get('/api/protected', authMiddleware, (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: 'This is a protected route',
      data: { user: req.user }
    });
  });

  // Error handling middleware
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    res.status(err.statusCode || 500).json({
      success: false,
      error: err.message || 'Internal server error'
    });
  });

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}); 