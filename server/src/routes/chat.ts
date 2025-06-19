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
  try {
    const { messages, email } = req.body;
    const chat = await ChatService.saveChat(messages, email);
    res.status(201).json(chat);
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ error: err.message || 'Failed to save chat.' });
  }
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