import express, { Request, Response } from 'express';
import { AuthService } from '../services/authService';

const router = express.Router();

/**
 * @swagger
 * TODO
 */
router.delete('/cleanup/users', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    console.error("/api/dev/cleanup/users DELETE email was missing");
    return res.status(400).json({
      success: false,
      error: 'Email is required'
    })
  }

  if (typeof email !== 'string') {
    console.error("/api/dev/cleanup/users DELETE email wasn't a string");
    return res.status(400).json({
      success: false,
      error: 'Email must be a string'
    })
  }  

  try { 
    await AuthService.delete(email);
  } catch (error: any) {
    console.error("/api/dev/cleanup/users DELETE error: " + error);
    return res.status(500).json({
      success: false,
      error: 'Invalid Login Error'
    })
  }
  
  const returnData = {
    success: true,
    message: 'User successfully deleted',
  }
  console.log("/api/dev/cleanup/users DELETE return data: " + JSON.stringify(returnData, null, 2));
  res.status(200).json(returnData);
});

export default router;