import express from 'express';
import { ChatService } from '../services/ChatService';

const router = express.Router();

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Save a new chat with user email
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - messages
 *               - email
 *             properties:
 *               messages:
 *                 type: array
 *                 description: Array of chat messages
 *                 items:
 *                   type: object
 *                   properties:
 *                     speaker:
 *                       type: string
 *                       example: "user"
 *                     text:
 *                       type: string
 *                       example: "Hello!"
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *     responses:
 *       201:
 *         description: Chat saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chat'
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Failed to save chat
 */
router.post('/', async (req, res) => {
  const { messages, email } = req.body;
  if (messages === undefined || email === undefined) {
    return res.status(400).json({
      success: false,
      error: "messages and email required"
    })
  }
  if (typeof email !== 'string') {
    return res.status(400).json({
      success: false,
      error: "email needs to be a string"
    })
  }
  if (!Array.isArray(messages)) {
    return res.status(400).json({
      success: false,
      error: "messages needs to be an array"
    })
  }
  if(messages.some((m) => !isProperMessage(m))) {
    return res.status(400).json({
      success: false,
      error: "Invalid speaker or text found on message"
    })
  }

  try {
    var chat = await ChatService.saveChat(messages, email);    
  } catch (error: any) {
    console.error("/api/chat POST error " + JSON.stringify(error, null, 2));
    res.status(500).json({ 
      success: false,
      error: 'Unable to save chat' 
    });
  }

  console.log("/api/chat POST created chat: " + JSON.stringify(chat, null, 2));
  res.status(201).json(chat);
});

/**
 * @swagger
 * /api/chat:
 *   get:
 *     summary: Get all chats for a specific user by email
 *     tags: [Chat]
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: User's email address
 *     responses:
 *       200:
 *         description: List of chats for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Chat'
 *       400:
 *         description: Email query parameter is required
 *       500:
 *         description: Failed to fetch chats
 */
router.get('/', async (req, res) => {
  try {
    const { email } = req.query;
    const chats = await ChatService.getChatsByEmail(email as string);
    res.json(chats);
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ error: err.message || 'Failed to fetch chats.' });
  }
});

export default router;

function isProperMessage(message: any) {
  const { speaker, text } = message;
  if (speaker === undefined || !['user', 'bot'].includes(speaker)) {
    return false;
  }
  if (text === undefined || typeof text !== 'string') {
    return false;
  }
  return true;
}
