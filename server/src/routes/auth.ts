import express from 'express';
import { AuthService } from '../services/authService';

const router = express.Router();

// Register route
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, email and password are required'
      });
    }

    const result = await AuthService.register(name, email, password);
    const token = result.token;
    
    res.status(201).json({
      success: true,
      message: 'Registration successful! Your account has been created and verified.',
      data: result.user,
      token: token
    });
  } catch (error: any) {
    console.log('Registration error details:', {
      message: error.message,
      statusCode: error.statusCode,
      code: error.code,
      name: error.name
    });
    
    // Handle specific error cases
    if (error.statusCode === 400 && error.message === 'Email already exists') {
      return res.status(400).json({
        success: false,
        error: 'Email already exists. Please try logging in instead.'
      });
    }
    
    // Handle other AppError instances
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
    }
    
    // Handle other errors
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed. Please try again.'
    });
  }
});

// Login route
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const result = await AuthService.login(email, password);
    const token = result.token;
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result.user,
      token: token
    });
  } catch (error) {
    next(error);
  }
});

export default router; 