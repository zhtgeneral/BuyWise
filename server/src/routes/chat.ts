import express from 'express';
import { ChatService } from '../services/ChatService';
import { authenticate } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * /api/chats:
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
 *                   required:
 *                     - speaker
 *                     - text
 *                     - timestamp
 *                   properties:
 *                     speaker:
 *                       type: string
 *                       enum: [user, bot]
 *                       example: "user"
 *                     text:
 *                       type: string
 *                       example: "Hello!"
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-05-15T10:00:00Z"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *     responses:
 *       201:
 *         description: Chat saved successfully
 *         content:
 *           application/json:
 *             example:
 *               _id: "507f1f77bcf86cd799439011"
 *               email: "user@example.com"
 *               messages:
 *                 - speaker: "user"
 *                   text: "Hello!"
 *                   timestamp: "2023-05-15T10:00:00Z"
 *                 - speaker: "bot"
 *                   text: "Hi there!"
 *                   timestamp: "2023-05-15T10:00:01Z"
 *               createdAt: "2023-05-15T10:05:00Z"
 *               updatedAt: "2023-05-15T10:05:00Z"
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 email:
 *                   type: string
 *                 messages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       speaker:
 *                         type: string
 *                       text:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             examples:
 *               missingFields:
 *                 summary: Missing required fields
 *                 value:
 *                   success: false
 *                   error: "messages and email required"
 *               invalidEmailType:
 *                 summary: Invalid email type
 *                 value:
 *                   success: false
 *                   error: "email needs to be a string"
 *               invalidMessagesType:
 *                 summary: Invalid messages type
 *                 value:
 *                   success: false
 *                   error: "messages needs to be an array"
 *               invalidMessageContent:
 *                 summary: Invalid message content
 *                 value:
 *                   success: false
 *                   error: "Invalid speaker or text found on message"
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 *       500:
 *         description: Failed to save chat
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: "Unable to save chat"
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 */
router.post('/', authenticate, async (req, res) => {
  const { messages, email, sessionId } = req.body;
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
    var chat = await ChatService.saveChat(messages, email, sessionId);    
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
 * /api/chats:
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
 *           example: "user@example.com"
 *         description: User's email address
 *     responses:
 *       200:
 *         description: List of chats for the user
 *         content:
 *           application/json:
 *             examples:
 *               successWithChats:
 *                 summary: Success with chat data
 *                 value:
 *                   success: true
 *                   chats:
 *                     - _id: "507f1f77bcf86cd799439011"
 *                       email: "user@example.com"
 *                       messages:
 *                         - speaker: "user"
 *                           text: "Hello!"
 *                           timestamp: "2023-05-15T10:00:00Z"
 *                         - speaker: "bot"
 *                           text: "Hi there!"
 *                           timestamp: "2023-05-15T10:00:01Z"
 *                       createdAt: "2023-05-15T10:05:00Z"
 *                       updatedAt: "2023-05-15T10:05:00Z"
 *                     - _id: "507f1f77bcf86cd799439012"
 *                       email: "user@example.com"
 *                       messages:
 *                         - speaker: "user"
 *                           text: "How are you?"
 *                           timestamp: "2023-05-16T11:00:00Z"
 *                       createdAt: "2023-05-16T11:05:00Z"
 *                       updatedAt: "2023-05-16T11:05:00Z"
 *               successNoChats:
 *                 summary: Success with no chats
 *                 value:
 *                   success: true
 *                   chats: []
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 chats:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       email:
 *                         type: string
 *                       messages:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             speaker:
 *                               type: string
 *                             text:
 *                               type: string
 *                             timestamp:
 *                               type: string
 *                               format: date-time
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: "email missing from query params"
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 *       500:
 *         description: Failed to fetch chats
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: "Failed to fetch chats"
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 */
router.get('/', authenticate, async (req, res) => {
  const { email } = req.query;
  if (!email) {
    console.error("/api/chats GET no email on query");
    return res.status(400).json({
      success: false,
      error: "email missing from query params"
    })
  }

  try {
    var chats = await ChatService.getChatsByEmail(email as string);
  } catch (error: any) {
    console.log("/api/chats GET error during fetch: " + JSON.stringify(error, null, 2));
    return res.status(500).json({ 
      success: false,
      error: 'Failed to fetch chats'
    });
  }

  console.log("/api/chats GET got chats: " + chats.length);
  return res.status(200).json({
    success: true,
    chats: chats
  });
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
