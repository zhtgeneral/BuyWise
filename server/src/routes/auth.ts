import express from 'express';
import { AuthService } from '../services/authService';

const router = express.Router();

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
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result.profile
    });
  } catch (error) {
    next(error);
  }
});

export default router; 