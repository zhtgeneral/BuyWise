import express, { Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { ProfileService } from '../services/ProfileService';

const router = express.Router();

/**
 * @swagger
 * /api/profiles:
 *   post:
 *     summary: Create a new profile
 *     tags: [Profiles]
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
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               ageRange:
 *                 type: string
 *                 enum: [18-24, 25-34, 35-44, 45-54, 55+]
 *               hobbies:
 *                 type: array
 *                 items:
 *                   type: string
 *               hasPets:
 *                 type: boolean
 *               hasChildren:
 *                 type: boolean
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   zipCode:
 *                     type: string
 *     responses:
 *       201:
 *         description: Profile created successfully
 *       400:
 *         description: Invalid input data
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const result = await ProfileService.createProfile(req.body);
    res.status(201).json({
      success: true,
      message: 'Profile created successfully',
      data: result
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/profiles/verify/{token}:
 *   get:
 *     summary: Verify email address
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired token
 */
router.get('/verify/:token', async (req: Request, res: Response) => {
  try {
    await ProfileService.verifyEmail(req.params.token);
    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/profiles/resend-verification:
 *   post:
 *     summary: Resend verification email
 *     tags: [Profiles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Verification email sent
 *       400:
 *         description: Invalid email or profile not found
 */
router.post('/resend-verification', async (req: Request, res: Response) => {
  try {
    await ProfileService.resendVerificationEmail(req.body.email);
    res.status(200).json({
      success: true,
      message: 'Verification email sent'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/profiles/{id}:
 *   get:
 *     summary: Get profile by ID
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       404:
 *         description: Profile not found
 */
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const profile = await ProfileService.getProfile(req.params.id);
    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/profiles/{id}:
 *   patch:
 *     summary: Update profile
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               ageRange:
 *                 type: string
 *                 enum: [18-24, 25-34, 35-44, 45-54, 55+]
 *               hobbies:
 *                 type: array
 *                 items:
 *                   type: string
 *               hasPets:
 *                 type: boolean
 *               hasChildren:
 *                 type: boolean
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   zipCode:
 *                     type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       404:
 *         description: Profile not found
 */
router.patch('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const profile = await ProfileService.updateProfile(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: profile
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/profiles/{id}/password:
 *   patch:
 *     summary: Update profile password
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Invalid current password
 *       404:
 *         description: Profile not found
 */
router.patch('/:id/password', authenticate, async (req: Request, res: Response) => {
  try {
    await ProfileService.updatePassword(
      req.params.id,
      req.body.currentPassword,
      req.body.newPassword
    );
    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error: any) {
    res.status(error.message.includes('Current password') ? 400 : 404).json({
      success: false,
      error: error.message
    });
  }
});

export default router; 