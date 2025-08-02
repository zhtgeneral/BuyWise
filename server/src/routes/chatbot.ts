import { Request, Response } from 'express';
import { ChatbotService } from '../services/ChatbotService';
import User from '../models/User';
import express from 'express';
import { authenticate } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * /api/chatbot:
 *   post:
 *     summary: Get AI response for a message
 *     tags: [Chatbot]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: The message to get AI response for
 *               conversationId:
 *                 type: string
 *                 description: Optional unique identifier for the conversation/chat (MongoDB _id)
 *     responses:
 *       200:
 *         description: Successful response from AI
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 chatbotMessage:
 *                   type: string
 *                   description: The AI's response
 *                 conversationId:
 *                   type: string
 *                   description: The conversation ID (MongoDB _id) for this chat
 *                 productData:
 *                   type: array
 *                   description: Product data if products were found (null if no products)
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       source:
 *                         type: string
 *                       title:
 *                         type: string
 *                       image:
 *                         type: string
 *                       price:
 *                         type: number
 *                       url:
 *                         type: string
 *                       rating:
 *                         type: number
 *                       reviews:
 *                         type: number
 *       400:
 *         description: Invalid request - message is required or invalid
 *       401:
 *         description: Unauthorized - invalid or missing JWT token
 *       500:
 *         description: Server error or incomplete AI response
 */
router.post('/', authenticate, async (req: Request, res: Response) => {  
  /** conversationId is allowed to be empty */
  const { message, conversationId } = req.body;
  
  if (message === undefined) {
    console.error(`/api/chatbot POST did not receive message: ${message}`);
    return res.status(400).json({ error: 'message is required' });
  }

  if (typeof message !== "string") {
    console.error(`/api/chatbot POST received message with type of: ${typeof message}`);
    return res.status(400).json({ error: 'message must be a string' });
  }
  
  if (message === '') {
    console.error(`/api/chatbot POST did not receive message: ${message}`);
    return res.status(400).json({ error: 'message cannot be empty' });
  }

  // TODO if more time test that conversationId is valid. Assume it is

  /** Assume authenticate middleware sets the req.user before this route  */
  const email = req.user?.email;
  const userId = req.user?.id;

  try {
    var result = await ChatbotService.processMessage(
      message,
      conversationId,
      email,
      userId
    );        
  } catch (error: unknown) {
    console.error(`/api/chatbot POST error: ${JSON.stringify(error, null, 2)}`);
    return res.status(500).json({ error: 'AI response failed' });    
  }

  console.log(`/api/chatbot POST result: ${JSON.stringify(result)}`);
  return res.status(200).json(result);
})

export default router;