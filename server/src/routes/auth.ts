import express, { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import User from '../models/User';
import { UserService } from '../services/UserService';

const router = express.Router();

/**
 * WARNING DO NOT PUT console.log("/api/auth/register POST for req: " + JSON.stringify(req, null, 2)) or else the test will time out
 */
router.post('/register', async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
    
  if (!name || !email || !password) {
    console.error("/api/auth/register POST name, email and password are required");
    return res.status(400).json({
      success: false,
      error: 'name, email and password are required'
    });
  }

  if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
    console.error("/api/auth/register POST name, email and password need to be strings");
    return res.status(400).json({
      success: false,
      error: 'name, email and password need to be strings'
    });
  }

  try {   
    var existingUser = await UserService.getUserByEmail(email);
  } catch (error: any) {
    console.error('/api/register POST Registration error: ', JSON.stringify(error, null, 2));
    return res.status(500).json({
      success: false,
      error: 'Unable to determine validity of email'
    });
  }

  if (existingUser) {
    console.error('/api/register POST Existing account found: ', JSON.stringify(existingUser, null, 2));
    return res.status(400).json({
      success: false,
      error: 'Email already exists. Pleast try logging in instead'
    });
  }

  try {
    var result = await AuthService.register(name, email, password);
  } catch (error: any) {
    console.error('/api/register POST Registration error: ', JSON.stringify(error, null, 2));
    res.status(500).json({
      success: false,
      error: 'Registration failed. Please try again'
    });
  }
console.log(result);

  return res.status(201).json({
    success: true,
    message: 'Registration successful! Your account has been created and verified',
    data: result.user,
    token: result.token
  });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required'
    })
  }

  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Email and password must be strings'
    })
  }

  const user = await UserService.getUserByEmail(email, true);
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Invalid email or password'
    })
  }

  if (!user.isEmailVerified) {
    return res.status(401).json({
      success: false,
      error: 'Please verify your email before logging in'
    })
  }

  try { 
    var result = await AuthService.login(user);
  } catch (error: any) {
    console.error("/api/login POST error: " + JSON.stringify(error, null, 2));
    return res.status(500).json({
      success: false,
      error: 'Unknown authentication error'
    })
  }
  
  const returnData = {
    success: true,
    message: 'Login successful',
    user: result.user,
    token: result.token
  }
  console.log("/api/auth/login POST return data: " + JSON.stringify(returnData, null, 2));
  res.status(200).json(returnData);
});

export default router; 