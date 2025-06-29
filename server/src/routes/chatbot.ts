import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { ProductService } from '../services/ProductService';
import { AIService } from '../services/AIService';

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

  if (message === undefined) {
    console.error(`/api/chatbot POST did not recieve message: ${message}`);
    return res.status(400).json({ error: 'Message is required' });
  }

  if (typeof message !== "string") {
    console.error(`/api/chatbot POST recieved message with type of: ${typeof message}`);
    return res.status(400).json({ error: 'Message must be a string' });
  }
  
  if (message === '') {
    console.error(`/api/chatbot POST did not recieve message: ${message}`);
    return res.status(400).json({ error: 'Message cannot be empty' });
  }

  try {
    var chatbotResponse = await AIService.chatCompletionGithubModel(message);
    console.log('/api/chatbot POST got chatbotResponse: ' + JSON.stringify(chatbotResponse, null, 2));
  } catch (error: unknown) {
    /** Chatbot fails */
    console.error(`/api/chatbot POST error: ${JSON.stringify(error, null, 2)}`);
    return res.status(500).json({ error: "Unable to call chatbot API" });    
  }

  if (!chatbotResponse || !chatbotResponse.chatbotMessage) {
    console.error('/api/chatbot POST recieved incomplete response from AI');
    return res.status(500).json({ error: 'AI unable to respond' });
  }

  if (!chatbotResponse.productRequested) {
    /** Chatbot works and no product requested */
    return res.status(200).json({
      chatbotMessage: chatbotResponse.chatbotMessage,
      productData: null
    });
  }

  try {
    var enrichedProducts = await ProductService.searchProducts(chatbotResponse.productQuery);
    console.log("/api/chatbot POST enrichedProducts: " + JSON.stringify(enrichedProducts.slice(0, 1), null, 2));
  } catch (error: any) {
    /** Chatbot works but Product fails */
    console.error('/api/chatbot POST unable to search for products' + JSON.stringify(error, null, 2));
    return res.status(200).json({
      chatbotMessage: chatbotResponse.chatbotMessage,
      productData: []
    });
  }

  /** Chatbot and Product works */
  const formattedData = formatProductForFrontend(enrichedProducts);
  console.log("/api/chatbot POST formattedData: " + JSON.stringify(formattedData.slice(0,10), null, 2));
  return res.status(200).json({
    chatbotMessage: chatbotResponse.chatbotMessage,
    productData: formattedData
  });
}


function formatProductForFrontend(products: any[]) {
  const formattedProducts = products.map((p) => {
    console.log("formatProductForFrontend: product seller details" + JSON.stringify(p.seller_details, null, 2));
    return {
      id: p.product_id || randomUUID(),
      source: p.source || "",
      title: p.title || "",
      image: p.thumbnail || "",
      price: p.extracted_price || 0,
      url: p.seller_details.direct_link || "",
      rating: p.rating || 0, // new field
      reviews: p.reviews || 0 // new field
    }
  })
  return formattedProducts;
}