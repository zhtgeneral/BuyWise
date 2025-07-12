import { Request, Response } from 'express';
import { ChatbotService } from '../services/ChatbotService';
import User from '../models/User';

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
export const postChat = async (req: Request, res: Response) => {  
  const { message, conversationId } = req.body;
  
  // Input validation
  if (!message) {
    console.log(`/api/chatbot POST did not receive message: ${message}`);
    return res.status(400).json({ error: 'Message is required' });
  }

  if (typeof message !== "string") {
    console.log(`/api/chatbot POST received message with type of: ${typeof message}`);
    return res.status(400).json({ error: 'Message must be a string' });
  }
  
  if (message === '') {
    console.error(`/api/chatbot POST did not receive message: ${message}`);
    return res.status(400).json({ error: 'Message cannot be empty' });
  }

  try {
    // Extract authenticated user info
    const userId = (req as any).user?.id;
    
    // Require authentication
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required to use chatbot' });
    }
    
    let userEmail = null;
    
    // Fetch user's email from the database
    try {
      const user = await User.findById(userId);
      userEmail = user?.email || null;
      console.log('Chatbot route: Found user email:', userEmail, 'for userId:', userId);
      
      if (!userEmail) {
        return res.status(401).json({ error: 'User not found' });
      }
    } catch (userError) {
      console.error('Chatbot route: Error fetching user:', userError);
      return res.status(500).json({ error: 'Error fetching user information' });
    }
    
    console.log('Chatbot route: Processing message from user:', userEmail, 'conversationId:', conversationId);
    
    // Process message through ChatbotService
    const result = await ChatbotService.processMessage(
      message,
      conversationId,
      userEmail,
      userId
    );
    
    return res.status(200).json(result);
  } catch (error: unknown) {
    console.log(`/api/chatbot POST error: ${JSON.stringify(error, null, 2)}`);
    return res.status(500).json({ error: 'AI response failed' });    
  }
}
