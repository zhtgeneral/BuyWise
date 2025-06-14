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
import { InferenceClient } from "@huggingface/inference";
import test from 'node:test';
const test_products = require('../static/products.json');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/BuyWise';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const client = new InferenceClient('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');


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

// TODO move to different file for better readability
app.post('/api/chatbot', async (req: Request, res: Response) => {
    const { message } = req.body;

    const chatCompletion = await client.chatCompletion({
      provider: "fireworks-ai",
      model: "meta-llama/Llama-3.1-70B-Instruct",
      messages: [
        {
          role: "user",
          content: `
            This is what the user said: ${message}
            Give appropriate responses using this business logic. The business logic contains possible scenarios and responses. Don't explain the reasoning. 
            business instructions: 
            if user sends none/empty message, 
              bot: "What type of electronics are you looking for?"

            if user sends any synonyms of 'laptop', 'phone', 'computer' (PC, tablet, mobiles all accepted),
              bot sends one of these
                "Based on you preferences I recommend these laptops/phones/computers (compares 3-5 together). If you would like to update your preferences, just let me know",
                "I could not find anything with your preferences on the web. Let me know if you would like to change your preferences."

            if user sends something other than  'laptop', 'phone', 'computer',
              bot sends "My AI can only search for laptops, phones, and computers. Would you like to search for any of these?"

            if the user asks how the chatbot is used,
              bot sends "I can help you search for laptops, phones, or computers on the web. Would you like to do that?"

            if the user says "yes" without any context,
              bot sends "Here are all products that I found. Let me know if you'd like to narrow down your search"

            if user sends unknown command or unspecified request,
              bot sends "As a chatbot, am I unsure what to do with that request. I can help you find laptops, phones, and computers on the web."
            
            if user sends something like "Why can't I purchase or checkout"
              bot sends "You are meant to purchase via the vendor. We don't stock the items."

            if user sends anything like "update budget to X"
              bot sends "backend (updates budget to min 0, max X). I have updated your max budget to X."

            if user sends anything like "these are too expensive" or "expensive"
              bot sends "backend (updates budget to min 0, max new number). I have updated your max budget to X."

            if user sends anything like "change location to X"
              bot sends one of 
                "backend (updates store to X). You should now see products from X sites"
                "I am unable to search for products from that location."

            if user sends anything like "higher ratings" or "set ratings to 5 stars"
              bot sends "backend (updates rating to 5). You should now see products with higher ratings"

            if user sends anything like "update email to X"
              bot sends "For security reasons, we don't allow changing of emails. Let me know if you'd like to change other preferences."

            if user sends anything like "this product is too old/slow" or "I want a specific model"
              bot sends "Our AI doesn't have the ability to search for individual items. Would you like to change your budget preferences?"

            if user sends anything like "bad products" or "bad" or "these are garbage"
              bot sends "Our AI fetches products from the web and we rely on websites to stock better products."

            if user sends a compliment like as "good", "nice" or "these products are good" or anything like this
              bots sends "We recommend you give us a 5 star rating."

            if user sends anything like "what do you sell?" or "what can I search for?"
              bots sends "I can help you find laptops, phones and computers on the web."
            
            if user sends anything referencing history like "use previous history" or "you said A B C in the past"
              bot sends "As a chatbot I can only look at the most recent prompts you give me."

            if user sends anything not in english
              bot sends "I can only respond to requests in English. What would you like to search for?"

            if user asks to buy anything used
              bots sends "I can only search for new laptops, phones, or computers on the web. Would you like to continue searching?"
          `,
        },
      ],
    });

    console.log(chatCompletion.choices[0].message.content);
})

app.get('/api/test-products', (req: Request, res: Response) => {
  return res.json(test_products);
})


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