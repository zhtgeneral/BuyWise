import { Request, Response } from 'express';
import { chatWithAgent } from '../agent/chatbotAgent';


// TODO should we make this route protected?

/**
 * @swagger
 * /api/chatbot:
 *   post:
 *     summary: Get AI response for a message
 *     tags: [Chatbot]
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
 *       500:
 *         description: Server error or incomplete AI response
 */
export const postChat = async (req: Request, res: Response) => {  
  const { message } = req.body;
  if (!message) {
    console.log(`/api/chatbot POST did not receive message: ${message}`);
    return res.status(400).json({ error: 'Message is required' });
  }

  if (typeof message !== "string") {
    console.log(`/api/chatbot POST received message with type of: ${typeof message}`);
    return res.status(400).json({ error: 'Message must be a string' });
  }
  
  if (message === '') {
    console.error(`/api/chatbot POST did not recieve message: ${message}`);
    return res.status(400).json({ error: 'Message cannot be empty' });
  }

  try {
    // Not sure if it's sufficient to just use sessionId, figure it out later
    const sessionId = req.ip || 'default';
    
    const agentResponse = await chatWithAgent(message, sessionId);
    console.log('/api/chatbot POST got LangChain response: ' + agentResponse.message);
    
    return res.status(200).json({
      chatbotMessage: agentResponse.message,
      productData: agentResponse.productData
    });
  } catch (error: unknown) {
    console.log(`/api/chatbot POST error: ${JSON.stringify(error, null, 2)}`);
    return res.status(500).json({ error: 'AI response failed' });    
  }
}
