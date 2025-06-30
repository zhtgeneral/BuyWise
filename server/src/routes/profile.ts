import express, { Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { ProfileService } from '../services/ProfileService';
import { UserService } from '../services/UserService';

const router = express.Router();

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
router.get('/verify/:token?', async (req: Request, res: Response) => {
  /** token is guaranteed to be a string becuase it is on params */
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({
      success: false,
      error: 'token missing from params'
    })
  }

  try {
    var user = await UserService.getUserByToken(token);
  } catch (error: any) {
    console.error("/api/profiles/verify/:token? GET error when getting user: " + JSON.stringify(error, null, 2));
    return res.status(500).json({
      success: false,
      error: 'Unable to get user'
    });
  }
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'Invalid or expired verification token'
    })
  }

  try {
    await UserService.verifyEmail(user);    
  } catch (error: any) {
    console.error("/api/profiles/verify/:token? GET error when verifying email " + JSON.stringify(error, null, 2));
    return res.status(500).json({
      success: false,
      error: 'Unable to verify email'
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Email verified successfully'
  });
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
 *         description: Invalid email or user not found
 */
router.post('/resend-verification', async (req: Request, res: Response) => {
  try {
    await UserService.resendVerificationEmail(req.body.email);
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
 * /api/profiles/me:
 *   get:
 *     summary: Get current user's profile
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       404:
 *         description: Profile not found
 */
router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const profile = await ProfileService.getProfileByUserId(req.user!.id);
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
 * /api/profiles/me:
 *   patch:
 *     summary: Update current user's profile
 *     tags: [Profiles]
 *     description: 
 *       This endpoint uses authentication middleware, so it needs Auth headers.
 *       Make sure to use Bearer <JWT> before making a request to this endpoint.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               storage_preference: 
 *                 type: string
 *                 enum: ['none', '64GB', '128GB', '256GB', '512GB', '1TB+']
 *               RAM_preference:
 *                 type: string
 *                 enum: ['none', '2GB', '4GB', '8GB', '16GB', '32GB+']
 *               brand_preference:
 *                 type: string
 *               min_budget: 
 *                 type: number
 *               max_budget:
 *                 type: number
 *               rating_preference:
 *                 type: number
 *               country:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       404:
 *         description: Profile not found 
 */
router.patch('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const profile = await ProfileService.updateProfile(req.user!.id, req.body);
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
 * /api/profiles/password:
 *   patch:
 *     summary: Update user password
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
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
 *         description: User not found
 */
router.patch('/password', authenticate, async (req: Request, res: Response) => {
  try {
    await UserService.updatePassword(
      req.user!.id,
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