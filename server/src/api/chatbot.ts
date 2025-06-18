import { Request, Response } from 'express';
import { chatCompleteHuggingFace } from '../ai/HuggingFace';
import { chatCompletionGithubModel } from '../ai/Github';


// TODO should we make this route protected?
/** 
 * This function gets the AI response.
 * Feel free to change the provider if API limits are hit.
 * */

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
 *                 chatbotResponse:
 *                   type: string
 *                   description: The AI's response
 *       400:
 *         description: Invalid request - message is required or invalid
 *       500:
 *         description: Server error or incomplete AI response
 */
export const postChat = async (req: Request, res: Response) => {  
  const { message } = req.body;
  if (!message) {
    console.log(`/api/chatbot POST did not recieve message: ${message}`);
    return res.status(400).json({ error: 'Message is required' });
  }
  if (typeof message !== "string") {
    console.log(`/api/chatbot POST recieved message with type of: ${typeof message}`);
    return res.status(400).json({ error: 'Message must be a string' });
  }

  try {
    // const chatbotResponse = await chatCompleteHuggingFace(message);  // alternative model, but rate limited
    const chatbotResponse = await chatCompletionGithubModel(message);

    if (!chatbotResponse) {
      console.log('/api/chatbot POST received incomplete response from AI');
      return res.status(500).json({ error: 'AI response was incomplete' });
    }

    return res.status(200).json({
      chatbotResponse: chatbotResponse
    });

  } catch (error: unknown) {
    console.log(`/api/chatbot POST error: ${JSON.stringify(error, null, 2)}`);
    return res.status(500);    
  }
}