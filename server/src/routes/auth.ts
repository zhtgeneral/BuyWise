import express, { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import User from '../models/User';
import { UserService } from '../services/UserService';

const router = express.Router();

/**
 * WARNING DO NOT PUT console.log("/api/auth/register POST for req: " + JSON.stringify(req, null, 2)) or else the test will time out
 */
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user account
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *                 description: User's full name
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "SecurePassword123!"
 *                 description: User's password (min 8 characters)
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Registration successful! Your account has been created and verified"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439011"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     email:
 *                       type: string
 *                       example: "user@example.com"
 *                     isEmailVerified:
 *                       type: boolean
 *                       example: true
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             examples:
 *               missingFields:
 *                 summary: Missing required fields
 *                 value:
 *                   success: false
 *                   error: "name, email and password are required"
 *               invalidTypes:
 *                 summary: Invalid field types
 *                 value:
 *                   success: false
 *                   error: "name, email and password need to be strings"
 *               emailExists:
 *                 summary: Email already registered
 *                 value:
 *                   success: false
 *                   error: "Email already exists. Please try logging in instead"
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             examples:
 *               emailCheckFailed:
 *                 summary: Email verification failed
 *                 value:
 *                   success: false
 *                   error: "Unable to register with that email"
 *               registrationFailed:
 *                 summary: Registration process failed
 *                 value:
 *                   success: false
 *                   error: "Registration failed. Please try again"
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
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
      error: 'Unable to register with that email'
    });
  }

  if (existingUser) {
    console.error('/api/register POST Existing account found: ', JSON.stringify(existingUser, null, 2));
    return res.status(400).json({
      success: false,
      error: 'Email already exists. Please try logging in instead'
    });
  }

  try {
    var result = await AuthService.register(name, email, password);
  } catch (error: any) {
    console.error('/api/register POST Registration error: ', JSON.stringify(error, null, 2));
    return res.status(500).json({
      success: false,
      error: 'Registration failed. Please try again'
    });
  }

  console.log('/api/register POST created user ');
  return res.status(201).json({
    success: true,
    message: 'Registration successful! Your account has been created and verified',
    data: result.user,
    token: result.token
  });
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authenticate a user and return JWT token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *                 description: User's registered email address
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "SecurePassword123!"
 *                 description: User's password
 *     responses:
 *       200:
 *         description: Successfully authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439011"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     email:
 *                       type: string
 *                       example: "user@example.com"
 *                     isEmailVerified:
 *                       type: boolean
 *                       example: true
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             examples:
 *               missingCredentials:
 *                 summary: Missing credentials
 *                 value:
 *                   success: false
 *                   error: "Email and password are required"
 *               invalidTypes:
 *                 summary: Invalid field types
 *                 value:
 *                   success: false
 *                   error: "Email and password must be strings"
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             examples:
 *               invalidCredentials:
 *                 summary: Invalid credentials
 *                 value:
 *                   success: false
 *                   error: "Invalid email or password"
 *               unverifiedEmail:
 *                 summary: Email not verified
 *                 value:
 *                   success: false
 *                   error: "Please verify your email before logging in"
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: "Unknown authentication error"
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 */
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
    var result = await AuthService.login(user, password);
  } catch (error: any) {
    console.error("/api/login POST error: " + JSON.stringify(error, null, 2));
    return res.status(500).json({
      success: false,
      error: 'Invalid Login Error'
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