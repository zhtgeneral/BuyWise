import { describe, beforeAll, beforeEach, afterEach, it, expect } from 'vitest';
import sinon from 'sinon';
import express from 'express';
import request from 'supertest'
import jwt, { JsonWebTokenError } from 'jsonwebtoken';

import chatRouter from '../../routes/chat';
import { ChatService } from '../../services/ChatService';

process.env.JWT_SECRET = "test-secret";

describe('Chat API', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/chats', chatRouter);    
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('/api/chats POST', () => {
    let originalSecret: string | undefined;

    beforeEach(() => {
      originalSecret = process.env.JWT_SECRET;
    });

    afterEach(() => {
      process.env.JWT_SECRET = originalSecret; // restore
    });

    it('should return 401 for no auth token on header', async () => {
      const response = await request(app)
        .post('/api/chats/')
        .expect(401)

      expect(response.body).to.deep.equal({
        success: false,
        error: 'No auth token in header'
      })
    });

    it('should return 500 for unconfigured JWT', async () => {
      delete process.env.JWT_SECRET;
      const response = await request(app)
        .post('/api/chats/')
        .set('Authorization', `Bearer sometoken`)
        .expect(500)

      expect(response.body).to.deep.equal({
        success: false,
        error: 'JWT not configured'
      })
    });

    it('should return 401 for JWT verification error', async () => {
      sinon.stub(jwt, 'verify').throws(new JsonWebTokenError("Some JWT verification error"));

      const response = await request(app)
        .post('/api/chats/')
        .set('Authorization', `Bearer sometoken`)
        .expect(401)

      expect(response.body).to.deep.equal({
        success: false,
        error: 'Invalid JWT'
      })
    });

    it('should return 500 for unknown error JWT', async () => {
      sinon.stub(jwt, 'verify').throws(new Error("Some other error during JWT verification"));

      const response = await request(app)
        .post('/api/chats/')
        .set('Authorization', `Bearer sometoken`)
        .expect(500)

      expect(response.body).to.deep.equal({
        success: false,
        error: 'Unknown error'
      })
    });

    it('should return 400 for missing messages', async () => {
      sinon.stub(jwt, 'verify').resolves();

      const response = await request(app)
        .post('/api/chats')
        .set('Authorization', `Bearer sometoken`)
        .send({          
          email: 'test@example.com'
        })
        .expect(400)

      expect(response.body).to.deep.equal({
        success: false,
        error: 'messages and email required'
      })
    });

    it('should return 400 for missing email', async () => {
      sinon.stub(jwt, 'verify').resolves();

      const response = await request(app)
        .post('/api/chats')
        .set('Authorization', `Bearer sometoken`)        
        .send({          
          messages: [
            {
              speaker: 'user',
              text: 'first message'
            },
            {
              speaker: 'bot',
              text: 'first reply'
            }
          ]
        })
        .expect(400)

      expect(response.body).to.deep.equal({
        success: false,
        error: 'messages and email required'
      })
    });

    it('should return 400 for non string email', async () => {
      sinon.stub(jwt, 'verify').resolves();

      const response = await request(app)
        .post('/api/chats')
        .set('Authorization', `Bearer sometoken`)                
        .send({          
          email: 123,
          messages: [
            {
              speaker: 'user',
              text: 'first message'
            },
            {
              speaker: 'bot',
              text: 'first reply'
            }
          ]
        })
        .expect(400)

      expect(response.body).to.deep.equal({
        success: false,
        error: 'email needs to be a string'
      })
    });

    it('should return 400 for non array messages', async () => {
      sinon.stub(jwt, 'verify').resolves();

      const response = await request(app)
        .post('/api/chats')
        .set('Authorization', `Bearer sometoken`)                
        .send({          
          email: 'text@example.com',
          messages: 'filler'
        })
        .expect(400)

      expect(response.body).to.deep.equal({
        success: false,
        error: 'messages needs to be an array'
      })
    });    
    
    it('should return 400 for missing text in messages', async () => {
      sinon.stub(jwt, 'verify').resolves();

      const response = await request(app)
        .post('/api/chats')
        .set('Authorization', `Bearer sometoken`)       
        .send({          
          email: 'text@example.com',
          messages: [
            {
              speaker: 'bot',
              text: 'first message'
            },
            {
              speaker: 'user',
            },
          ]
        })
        .expect(400)

      expect(response.body).to.deep.equal({
        success: false,
        error: 'Invalid speaker or text found on message'
      })
    });   

    it('should return 400 for missing speaker in messages', async () => {
      sinon.stub(jwt, 'verify').resolves();

      const response = await request(app)
        .post('/api/chats')
        .set('Authorization', `Bearer sometoken`)      
        .send({          
          email: 'text@example.com',
          messages: [
            {
              speaker: 'bot',
              text: 'first message'
            },
            {
              text: 'first reply'
            },
          ]
        })
        .expect(400)

      expect(response.body).to.deep.equal({
        success: false,
        error: 'Invalid speaker or text found on message'
      })
    });   

    it('should return 400 for invalid speaker in messages', async () => {
      sinon.stub(jwt, 'verify').resolves();

      const response = await request(app)
        .post('/api/chats')
        .set('Authorization', `Bearer sometoken`)      
        .send({          
          email: 'text@example.com',
          messages: [
            {
              speaker: 'bot',
              text: 'first message'
            },
            {
              speaker: 'NOT A BOT OR A USER',
              text: 'first reply'
            }
          ]
        })
        .expect(400)

      expect(response.body).to.deep.equal({
        success: false,
        error: 'Invalid speaker or text found on message'
      })
    });    

    it('should return 400 for non string text in messages', async () => {
      sinon.stub(jwt, 'verify').resolves();

      const response = await request(app)
        .post('/api/chats')
        .set('Authorization', `Bearer sometoken`)      
        .send({          
          email: 'text@example.com',
          messages: [
            {
              speaker: 'bot',
              text: 'first message'
            },
            {
              speaker: 'user',
              text: 12345
            }
          ]
        })
        .expect(400)

      expect(response.body).to.deep.equal({
        success: false,
        error: 'Invalid speaker or text found on message'
      })
    });    
  
    it('should return 500 for failed save chat', async () => {
      sinon.stub(jwt, 'verify').resolves();      
      sinon.stub(ChatService, 'saveChat').throws(new Error("Some error in save chat"));

      const response = await request(app)
        .post('/api/chats')
        .set('Authorization', `Bearer sometoken`)      
        .send({          
          email: 'text@example.com',
          messages: [
            {
              speaker: 'bot',
              text: 'first message'
            },
            {
              speaker: 'user',
              text: 'first reply'
            }
          ]
        })
        .expect(500)

      expect(response.body).to.deep.equal({
        success: false,
        error: 'Unable to save chat'
      })
    })

    it('should return 201 for working save chat', async () => {
      const testDate = new Date('2025-06-30T01:14:27.853Z').toISOString();
      const messagesData = [
        {
          speaker: 'bot',
          text: 'first message',
          timestamp: testDate
        },
        {
          speaker: 'user',
          text: 'first reply',
          timestamp: testDate
        }
      ]
      const mockChat = {
        messages: messagesData,
        email: 'text@example.com',
        createdAt: testDate
      }

      sinon.stub(jwt, 'verify').resolves();      
      sinon.stub(ChatService, 'saveChat').resolves(mockChat);

      const response = await request(app)
        .post('/api/chats')
        .set('Authorization', `Bearer sometoken`)      
        .send({          
          email: 'text@example.com',
          messages: messagesData
        })
        .expect(201)

      expect(response.body).to.deep.equal(mockChat)
    })
  });

  describe('/api/chats GET', () => {
    let originalSecret: string | undefined;

    beforeEach(() => {
      originalSecret = process.env.JWT_SECRET;
    });

    afterEach(() => {
      process.env.JWT_SECRET = originalSecret; // restore
    });

     it('should return 401 for no auth token on header', async () => {
      const response = await request(app)
        .get('/api/chats/')
        .expect(401)

      expect(response.body).to.deep.equal({
        success: false,
        error: 'No auth token in header'
      })
    });

    it('should return 500 for unconfigured JWT', async () => {
      delete process.env.JWT_SECRET;
      const response = await request(app)
        .get('/api/chats/')
        .set('Authorization', `Bearer sometoken`)
        .expect(500)

      expect(response.body).to.deep.equal({
        success: false,
        error: 'JWT not configured'
      })
    });

    it('should return 401 for JWT verification error', async () => {
      sinon.stub(jwt, 'verify').throws(new JsonWebTokenError("Some JWT verification error"));

      const response = await request(app)
        .get('/api/chats/')
        .set('Authorization', `Bearer sometoken`)
        .expect(401)

      expect(response.body).to.deep.equal({
        success: false,
        error: 'Invalid JWT'
      })
    });

    it('should return 500 for unknown error JWT', async () => {
      sinon.stub(jwt, 'verify').throws(new Error("Some other error during JWT verification"));

      const response = await request(app)
        .get('/api/chats/')
        .set('Authorization', `Bearer sometoken`)
        .expect(500)

      expect(response.body).to.deep.equal({
        success: false,
        error: 'Unknown error'
      })
    });

    it('should return 400 for missing email on query params', async () => {
      sinon.stub(jwt, 'verify').resolves();    

      const response = await request(app)
        .get('/api/chats')
        .set('Authorization', `Bearer sometoken`)      
        .expect(400)

      expect(response.body).to.deep.equal({
        success: false,
        error: 'email missing from query params'
      })
    })

    it('should return 500 for unknown error during fetch', async () => {
      sinon.stub(jwt, 'verify').resolves();    
      sinon.stub(ChatService, 'getChatsByEmail').throws(new Error("Some error related to fetching chats"));

      const response = await request(app)
        .get('/api/chats?email=test@example.com')
        .set('Authorization', `Bearer sometoken`)      
        .expect(500)

      expect(response.body).to.deep.equal({
        success: false,
        error: 'Failed to fetch chats'
      })
    })

    it('should return 200 for successful fetch', async () => {
      const testDate = new Date('2025-06-30T01:14:27.853Z').toISOString();
      const fakeChats = [
        {
          "_id": "507f1f77bcf86cd799439011",
          "email": "test@example.com",
          "messages": [
            {
              "speaker": "user",
              "text": "I want macbooks",
              "timestamp": testDate
            },
            {
              "speaker": "bot",
              "text": "Here are some macbooks I found!",
              "timestamp": testDate,
              "recommendedProducts": [
                {
                  id: 'product id',
                  source: 'Apple',
                  title: 'macbook air',
                  image: 'some image url',
                  price: 1400,
                  url: 'some url',
                  rating: 4.5,
                  reviews: 220
                },
                {
                  id: 'product id',
                  source: 'Apple',
                  title: 'macbook mini',
                  image: 'some image url',
                  price: 1300,
                  url: 'some url',
                  rating: 4.0,
                  reviews: 30
                }
              ]
            }
          ],
        "createdAt": testDate,
        "updatedAt": testDate
      },
      {
        "_id": "507f1f77bcf86cd799439012",
        "email": "test@example.com",
        "messages": [
          {
            "speaker": "user",
            "text": "How are you?",
            "timestamp": testDate
          },
          {
            "speaker": "bot",
            "text": "Let's keep this chat focused on electronics!",
            "timestamp": testDate,
            "recommendedProducts": []
          }
        ],
        "createdAt": testDate,
        "updatedAt": testDate
      }
    ]    

    sinon.stub(jwt, 'verify').resolves();    
    sinon.stub(ChatService, 'getChatsByEmail').resolves(fakeChats);

      const response = await request(app)
        .get('/api/chats?email=test@example.com')
        .set('Authorization', `Bearer sometoken`)      
        .expect(200)

      expect(response.body).to.deep.equal({
        success: true,
        chats: fakeChats
      })
    })
  })
});

