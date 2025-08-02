import { describe, beforeEach, beforeAll, afterEach, it, expect } from 'vitest';
import sinon from 'sinon';
import request from 'supertest';
import express from 'express';
import jwt, { JsonWebTokenError } from 'jsonwebtoken';

import chatbotRoutes from '../../routes/chatbot';
import { AIService } from '../../services/AIService';
import { ProductService } from '../../services/ProductService';
import { ChatbotService } from '../../services/ChatbotService';


/**
 * NOTE
 * This tests the backend logic for the API call.
 * It does not test the AI's response to the user input.
 * To do that, test it manually here https://github.com/marketplace/models/azureml-meta/Meta-Llama-3-1-8B-Instruct/playground/json
 * 
 * SECOND NOTE
 * This is not a unit test. It is an integration test because it checks for validation.
 */
describe('Chatbot API', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/chatbot', chatbotRoutes);
  });

  afterEach(() => {
    sinon.restore();
  });


  describe('/api/chatbot POST', async () => {    
    let originalSecret: string | undefined;

    beforeEach(() => {
      originalSecret = process.env.JWT_SECRET;
    });

    afterEach(() => {
      process.env.JWT_SECRET = originalSecret; 
    })

    it('should return 401 for no auth token on header', async () => {
      const response = await request(app)
        .post('/api/chatbot')
        /** Missing auth header */
        .send({ message: "some message", conversationId: "some id" })
        .expect(401)

      expect(response.body).to.deep.equal({
        success: false,
        error: 'No auth token in header'
      })
    });

    it('returns 400 code for missing message', async () => {    
      sinon.stub(jwt, 'verify').resolves();  
      const response = await request(app)
        .post('/api/chatbot')
        .set('Authorization', `Bearer sometoken`)
        .send({})
        .expect(400)
      
      expect(response.body).to.deep.equal({ error: 'message is required' });
    });

    it('returns 400 code for wrong data type', async () => {      
      sinon.stub(jwt, 'verify').resolves();  
      const response = await request(app)
        .post('/api/chatbot')
        .set('Authorization', `Bearer sometoken`)
        .send({ message: 123, conversationId: 123 })        
        .expect(400)

      expect(response.body).to.deep.equal({ error: 'message must be a string' });
    });

    it('returns 400 code for empty message', async () => {  
      sinon.stub(jwt, 'verify').resolves();      
      const response = await request(app)
        .post('/api/chatbot')
        .set('Authorization', `Bearer sometoken`)
        .send({ message: "", conversationId: "someId" })
        .expect(400)
      
      expect(response.body).to.deep.equal({ error: 'message cannot be empty' });
    });

    it('returns 500 code for failed chatbot API call', async () => {
      sinon.stub(jwt, 'verify').resolves();      
      sinon.stub(ChatbotService, 'processMessage').throws(new Error("some API error message"));
      const response = await request(app)
        .post('/api/chatbot')
        .set('Authorization', `Bearer sometoken`)
        .send({ message: "hi", conversationId: "some id" })
        .expect(500)

      expect(response.body).to.deep.equal({ error: 'AI response failed' });
    });

    it('returns 200 code for working chatbot API without products', async () => {
      const responseNoProducts = {
        chatbotMessage: "What would you like to search for?",
        responseConversationId: "some id",
        productData: []
      }

      sinon.stub(jwt, 'verify').resolves();      
      sinon.stub(ChatbotService, 'processMessage').resolves(responseNoProducts)
      
      const response = await request(app)
        .post('/api/chatbot')
        .set('Authorization', `Bearer sometoken`)
        .send({ message: "test message", conversationId: "some id" })
        .expect(200)

      expect(response.body).to.deep.equal(responseNoProducts);   
    });

    it('returns 200 code for working chatbot API', async () => {
      const responseSomeProducts = {
        chatbotMessage: "What would you like to search for?",
        responseConversationId: "some id",
        productData: [
          {
            product_id: "123",
            source: "Best Buy",
            title: "MacBook Pro",
            thumbnail: "image.jpg",
            extracted_price: 1299,
            seller_details: { direct_link: "http://example.com" },
            rating: 4.5,
            reviews: 120
          }
        ]
      }

      sinon.stub(jwt, 'verify').resolves();    
      sinon.stub(ChatbotService, 'processMessage').resolves(responseSomeProducts)       

      const response = await request(app)
        .post('/api/chatbot')
        .set('Authorization', `Bearer sometoken`)
        .send({ message: "I want some macbooks", conversationId: "some id" })
        .expect(200)

      expect(response.body).to.deep.equal(responseSomeProducts);   
    });  
  })
})