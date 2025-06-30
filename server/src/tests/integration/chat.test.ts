import sinon from 'sinon';
import { expect } from 'chai';
import express from 'express';
import request from 'supertest'

import { AuthService } from '../../services/authService';
import { IUser } from '../../models/User';
import authRoutes from '../../routes/auth';
import { UserService } from '../../services/UserService';
import chatRouter from '../../routes/chat';
import { ChatService } from '../../services/ChatService';
import { IMessage } from '../../models/Chat';

process.env.JWT_SECRET = "test-secret";

describe('Chat API', () => {
  let app: express.Express;
  
  before(() => {
    app = express();
    app.use(express.json());
    app.use('/api/chat', chatRouter);    
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('/api/chat POST', () => {
    it('should return 400 for missing messages', async () => {
      const response = await request(app)
        .post('/api/chat')
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
      const response = await request(app)
        .post('/api/chat')
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
      const response = await request(app)
        .post('/api/chat')
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
      const response = await request(app)
        .post('/api/chat')
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
      const response = await request(app)
        .post('/api/chat')
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
      const response = await request(app)
        .post('/api/chat')
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
      const response = await request(app)
        .post('/api/chat')
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
      const response = await request(app)
        .post('/api/chat')
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
      sinon.stub(ChatService, 'saveChat').throws(new Error("Some error in save chat"));
      const response = await request(app)
        .post('/api/chat')
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

    it('should return 200 for working save chat', async () => {
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

      sinon.stub(ChatService, 'saveChat').resolves(mockChat);

      const response = await request(app)
        .post('/api/chat')
        .send({          
          email: 'text@example.com',
          messages: messagesData
        })
        .expect(201)

      expect(response.body).to.deep.equal(mockChat)
    })
  });
});

