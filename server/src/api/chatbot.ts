import { Request, Response } from 'express';
import { chatCompleteHuggingFace } from '../ai/HuggingFace';
import { chatCompletionGithubModel } from '../ai/Github';
import axios from 'axios';


// TODO should we make this route protected?
/** 
 * This function gets the AI response.
 * Feel free to change the provider if API limits are hit.
 * */
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
    console.log('/api/chatbot POST got chatbotResponse: ' + JSON.stringify(chatbotResponse, null, 2));

    if (!chatbotResponse) {
      console.log('/api/chatbot POST recieved incomplete response from AI');
      return res.status(500).json({ error: 'AI response was incomplete' });
    }

    if (chatbotResponse.productRequested) {
      // TODO Product API here
      // axios.post('/api/products...', ...)
    }

    return res.status(200).json({
      chatbotMessage: chatbotResponse.chatbotMessage
    });

  } catch (error: unknown) {
    console.log(`/api/chatbot POST error: ${JSON.stringify(error, null, 2)}`);
    return res.status(500);    
  }
}