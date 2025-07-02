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
 *         description: Ok
 *         content:
 *           application/json:
 *             examples:
 *               AllWorking:
 *                 summary: Successfully verified email
 *                 value:
 *                   success: true
 *                   message: Email verified successfully
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             examples:
 *               MissingToken:
 *                 summary: Request params didn't recieve a token
 *                 value:
 *                   success: false
 *                   error: token missing from params
 *       404:
 *         description: Unknown user
 *         content:
 *           application/json:
 *             examples:
 *               UnknownUser:
 *                 summary: Request params recieved an invalid token
 *                 value:
 *                   success: false
 *                   error: Invalid or expired verification token
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             examples:
 *               GetUserError:
 *                 summary: Error with UserService getUserByToken
 *                 value:
 *                   success: false
 *                   error: Unable to get user
 *               VerifyEmailError:
 *                 summary: Error with UserService verifyEmail
 *                 value:
 *                   success: false
 *                   error: Unable to verify email
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
 *         description: Ok
 *         content:
 *           application/json:
 *             examples:
 *               AllWorking:
 *                 summary: Successfully resent verification
 *                 value:
 *                   success: true
 *                   message: Verification email sent
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             examples:
 *               MissingEmail:
 *                 summary: Request didn't recieve an email
 *                 value:
 *                   success: false
 *                   error: email is required
 *               NonStringEmail:
 *                 summary: Request recieved an email that wasn't a string
 *                 value:
 *                   success: false
 *                   error: email must be a string
 *               UserAlreadyVerified:
 *                 summary: User was already verified and resent verification
 *                 value:
 *                   success: false
 *                   error: email is already verified
 *       404:
 *         description: Cannot find user
 *         content:
 *           application/json:
 *             examples:
 *               CannotFindUser:
 *                 summary: Request received an unknown email
 *                 value:
 *                   success: false
 *                   error: user cannot be found
 *       500:
 *         description: Server Erros
 *         content:
 *           application/json:
 *             examples:
 *               GetUserError:
 *                 summary: Error with UserService getUserByEmail
 *                 value:
 *                   success: false
 *                   error: Unable to get user while verifying email
 *               ResendEmailError:
 *                 summary: Error with UserService resendVerificationEmail
 *                 value:
 *                   success: false
 *                   error: Unable to resend verification email
 */
router.post('/resend-verification', async (req: Request, res: Response) => {
  const { email } = req.body;

  if (email === undefined) {
    console.error("/api/profiles/resend-verification POST no email found");
    return res.status(400).json({
      success: false,
      error: 'email is required'
    })
  }

  if (typeof email !== 'string') {
    console.error("/api/profiles/resend-verification POST email was not a string");
    return res.status(400).json({
      success: false,
      error: 'email must be a string'
    })
  }

  try {
    var user = await UserService.getUserByEmail(email);
  } catch (error: any) {
    console.error("/api/profiles/resend-verification POST error while getting user: " + JSON.stringify(error, null, 2));
    return res.status(500).json({
      success: false,
      error: 'Unable to get user while verifying email'
    })
  }

  if (!user) {
    console.error("/api/profiles/resend-verification POST user cannot be found");
    return res.status(404).json({
      success: false,
      error: 'user cannot be found'
    })
  }

  if (user.isEmailVerified) {
    console.error("/api/profiles/resend-verification POST user is already verified");
    return res.status(400).json({
      success: false,
      error: 'email is already verified'
    })
  }

  try {
    await UserService.resendVerificationEmail(user);    
  } catch (error: any) {
    console.error("/api/profiles/resend-verification POST unknown error during resending verification: " + JSON.stringify(error, null, 2));
    res.status(500).json({
      success: false,
      error: 'Unable to resend verification email'
    });
  }

  console.log("/api/profiles/resend-verification POST succesffuly sent verification email");
  res.status(200).json({
    success: true,
    message: 'Verification email sent'
  });
});

/**
 * @swagger
 * /api/profiles/:userId:
 *   get:
 *     summary: Get current user's profile
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ok
 *         content:
 *           application/json:
 *             examples:
 *               AllWorking:
 *                 summary: Successfully retrieved profile
 *                 value:
 *                   success: true
 *                   message: Successfully retrieved profile,
 *                   data: profile
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             examples:
 *               CannotFindProfile:
 *                 summary: Cannot find profile
 *                 value:
 *                   success: false
 *                   error: Unable to get profile with userId
 * 
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             examples:
 *               MissingUserIdOnParams:
 *                 summary: Cannot find profile
 *                 value:
 *                   success: false
 *                   error: Unknown error during getting profile
 * 
 *       401:
 *         description: Unauthenticated
 *         content:
 *           application/json:
 *             examples:
 *               NoAuthHeader: 
 *                 summary: No auth token in header
 *                 value:
 *                   success: false
 *                   error: No auth token in header
 *               InvalidJWT: 
 *                 summary: JWT did not match
 *                 value:
 *                   success: false
 *                   error: Invalid JWT
 * 
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             examples:
 *               UnknownError:
 *                 summary: Error during ProfileService getProfileByUserId
 *                 value:
 *                   success: false
 *                   error: Unknown error during getting profile
 *               JWTConfigError:
 *                 summary: Error during JWT setup
 *                 value:
 *                   success: false
 *                   error: JWT not configured
 *               JWTUnknownError:
 *                 summary: Unknown Error during JWT verification
 *                 value:
 *                   success: false
 *                   error: Unknown error
 */
router.get('/:userId?', authenticate, async (req: Request, res: Response) => {
  const { userId } = req.params;
  console.log("/api/profiles/:userId got userId on params: " + JSON.stringify(userId));

  if (!userId) {
    console.error("/api/profiles/:userId GET cannot find userId on params");
    return res.status(400).json({
      success: false,
      error: 'userId missing from params'
    })
  }

  try {
    var profile = await ProfileService.getProfileByUserId(userId);
  } catch (error: any) {
    console.error("/api/profiles/:userId GET error during getting profile: " + JSON.stringify(error, null, 2));
    return res.status(500).json({
      success: false,
      error: 'Unknown error during getting profile'
    })
  }

  if (!profile) {
    console.error("/api/profiles/:userId GET cannot find profile");
    return res.status(404).json({
      success: false,
      error: 'Unable to get profile with userId'
    })
  }

  console.log("/api/profiles/:userId GET got profile: " + JSON.stringify(profile, null, 2));
  return res.status(200).json({
    success: true,
    message: 'Successfully retrieved profile',
    data: profile
  })
});

// TODO docs
/**
 * @swagger
 * /api/profiles/:userId:
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
 *       401:
 *         description: Unauthenticated
 *         content:
 *           application/json:
 *             examples:
 *               NoAuthToken:
 *                 summary: Recieved request without auth token in header
 *                 value:
 *                   success: false
 *                   error: No auth token in header
 *               InvalidJWT:
 *                 summary: recieved invalid JWT in header
 *                 value:
 *                   success: false
 *                   error: Invalid JWT
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             examples:
 *               NoUserId:
 *                 summary: Recieved request without userId on params
 *                 value:
 *                   success: false
 *                   error: userId missing from params
 *               NoUpdateData:
 *                 summary: Recieved request without profileData in body
 *                 value:
 *                   success: false
 *                   error: profileData missing from body
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             examples:
 *               UnconfiguredJWT:
 *                 summary: Attempted request without configuring JWT in env
 *                 value:
 *                   success: false
 *                   error: JWT not configured
 *               UnknownJWT:
 *                 summary: Unknown error occured during JWT verification
 *                 value:
 *                   success: false
 *                   error: Unknown error
 *               FetchProfile:
 *                 summary: Unknown error occured during fetching profile
 *                 value:
 *                   success: false
 *                   error: Unknown error during getting profile
 *               UpdateProfile:
 *                 summary: Unknown error occured during updating profile
 *                 value:
 *                   success: false
 *                   error: Unable to update profile
 *       404:
 *         description: Not Found
 *         content:
 *           application/json:
 *             examples:
 *               UnknownProfile:
 *                 summary: Request recieved a userId but led to no profile
 *                 value:
 *                   success: false
 *                   error: No profile found
 * 
 *       200:
 *         description: Ok
 *         content:
 *           application/json:
 *             examples:
 *               AllWorking:
 *                 summary: All working
 *                 value:
 *                   success: true
 *                   message: Profile updated successfully
 *                   data: fakeProfileData
 */
router.patch('/:userId?', authenticate, async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { profileData } = req.body;
  if (!userId) {
    console.error("/api/profiles/:userId PATCH missing userId on params")
    return res.status(400).json({
      success: false,
      error: 'userId missing from params'
    })
  }
  if (!profileData) {
    console.error("/api/profiles/:userId PATCH missing profileData in body")
    return res.status(400).json({
      success: false,
      error: 'profileData missing from body'
    })
  }

  try {
    var profile = await ProfileService.getProfileByUserId(userId);
  } catch (error: any) {
    console.error("/api/profiles/:userId PATCH error during fetching profile: " + JSON.stringify(error, null, 2));
    return res.status(500).json({
      success: false,
      error: 'Unknown error during getting profile'
    })
  }

  if (!profile) {
    console.error("/api/profiles/:userId PATCH profile not found");
    return res.status(404).json({
      success: false,
      error: 'No profile found'
    })
  }

  try {
    var updatedProfile = await ProfileService.updateProfile(profile, profileData);    
  } catch (error: any) {
    console.error("/api/profiles/:userId PATCH error during updating profile: " + JSON.stringify(error, null, 2));
    res.status(500).json({
      success: false,
      error: 'Unable to update profile'
    });
  }

  console.log("/api/profiles/:userId PATCH got updated profile " + JSON.stringify(updatedProfile, null, 2));
  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: updatedProfile
  });
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