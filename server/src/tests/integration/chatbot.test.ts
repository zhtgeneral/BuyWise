import * as chai from 'chai';
import sinon from 'sinon';
import request from 'supertest';
import express from 'express';

import { postChat } from '../../routes/chatbot';
import { AIService } from '../../services/AIService';
import { ProductService } from '../../services/ProductService';

const expect = chai.expect;

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

  before(() => {
    app = express();
    app.use(express.json());
    app.post('/api/chatbot', postChat);
  });

  afterEach(() => {
    sinon.restore();
  });


  describe('/api/chatbot POST', async () => {    
    it('returns 400 code for missing message', async () => {      
      const response = await request(app)
        .post('/api/chatbot')
        .send({})
        .expect(400)
      
      expect(response.body).to.deep.equal({ error: 'Message is required' });
    });

    it('returns 400 code for wrong data type', async () => {      
      const response = await request(app)
        .post('/api/chatbot')
        .send({ message: 0 })
        .expect(400)

      expect(response.body).to.deep.equal({ error: 'Message must be a string' });
    });

    it('returns 400 code for empty message', async () => {      
      const response = await request(app)
        .post('/api/chatbot')
        .send({ message: "" })
        .expect(400)
      
      expect(response.body).to.deep.equal({ error: 'Message cannot be empty' });
    });

    it('returns 500 code for failed chatbot API call', async () => {
      sinon.stub(AIService, 'chatCompletionGithubModel').throws(new Error("some API error message"));
      const response = await request(app)
        .post('/api/chatbot')
        .send({ message: "hi" })
        .expect(500)

      expect(response.body).to.deep.equal({ error: 'Unable to call chatbot API' });
    });

    it('returns 500 code for incomplete chatbot response', async () => {
      sinon.stub(AIService, 'chatCompletionGithubModel').resolves({
        chatbotMessage: "",
        productRequested: false,
        productQuery: ""
      })

      const response = await request(app)
        .post('/api/chatbot')
        .send({ message: "give me an incomplete response" })
        .expect(500)

      expect(response.body).to.deep.equal({ error: 'AI unable to respond' });
    });

    it('returns 200 code for working chatbot API without products', async () => {
      sinon.stub(AIService, 'chatCompletionGithubModel').resolves({
        chatbotMessage: "What would you like to search for?",
        productRequested: false,
        productQuery: ""
      })
      const response = await request(app)
        .post('/api/chatbot')
        .send({ message: "test message" })
        .expect(200)

      expect(response.body).to.deep.equal({ 
        chatbotMessage: "What would you like to search for?",
        productData: null
      });   
    });

    it('returns 200 code for working chatbot API and failed product API', async () => {
      sinon.stub(AIService, 'chatCompletionGithubModel').resolves({
        chatbotMessage: "Here are some macbooks I found.",
        productRequested: true,
        productQuery: "macbook"
      })
      sinon.stub(ProductService, 'searchProducts').throws(new Error("some API error message"));

      const response = await request(app)
        .post('/api/chatbot')
        .send({ message: "I want some macbooks" })
        .expect(200)

      expect(response.body).to.deep.equal({ 
        chatbotMessage: "Here are some macbooks I found.",
        productData: []
      });   
    });

    it('returns 200 code for working chatbot API and product API', async () => {
      const mockProduct = {
        product_id: "123",
        source: "Best Buy",
        title: "MacBook Pro",
        thumbnail: "image.jpg",
        extracted_price: 1299,
        seller_details: { direct_link: "http://example.com" },
        rating: 4.5,
        reviews: 120
      }
      sinon.stub(AIService, 'chatCompletionGithubModel').resolves({
        chatbotMessage: "Here are some macbooks I found.",
        productRequested: true,
        productQuery: "macbook"
      })
      sinon.stub(ProductService, 'searchProducts').resolves([mockProduct]);

      const response = await request(app)
        .post('/api/chatbot')
        .send({ message: "I want some macbooks" })
        .expect(200)

      expect(response.body).to.deep.equal({ 
        chatbotMessage: "Here are some macbooks I found.",
        productData: [{
          id: mockProduct.product_id,
          source: mockProduct.source,
          title: mockProduct.title,
          image: mockProduct.thumbnail,
          price: mockProduct.extracted_price,
          url: mockProduct.seller_details.direct_link,
          rating: mockProduct.rating,
          reviews: mockProduct.reviews
        }]
      });        
    });    
  })
})