import { describe, beforeAll, afterEach, it, expect } from 'vitest';
import sinon from 'sinon';
import express from 'express';
import request from 'supertest'

import { AuthService } from '../../services/authService';
import { IUser } from '../../models/User';
import authRoutes from '../../routes/auth';
import { UserService } from '../../services/UserService';

process.env.JWT_SECRET = "test-secret";

describe('Auth API', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);    
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('/api/auth/register POST', () => {
    it('should return 400 for missing name', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({          
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(400)

      expect(response.body).to.deep.equal({
        success: false,
        error: 'name, email and password are required'
      })
    });

    it('should return 400 for missing email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({          
          name: 'test name',          
          password: 'password123'
        })
        .expect(400)

      expect(response.body).to.deep.equal({
        success: false,
        error: 'name, email and password are required'
      })
    });

    it('should return 400 for missing password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({          
          name: 'test name',          
          email: 'test@example.com',
        })
        .expect(400)

      expect(response.body).to.deep.equal({
        success: false,
        error: 'name, email and password are required'
      })
    });

    it('should return 400 for non string name', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({          
          name: 123,
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(400)

      expect(response.body).to.deep.equal({
        success: false,
        error: 'name, email and password need to be strings'
      })
    });

    it('should return 400 for non string email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({          
          name: 'test name',
          email: 123,
          password: 'password123'
        })
        .expect(400)

      expect(response.body).to.deep.equal({
        success: false,
        error: 'name, email and password need to be strings'
      })
    });

    it('should return 400 for non string password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({          
          name: 'test name',
          email: 'test@example.com',
          password: 123
        })
        .expect(400)

      expect(response.body).to.deep.equal({
        success: false,
        error: 'name, email and password need to be strings'
      })
    });

    it('should return 500 for failed email validation', async () => {      
      sinon.stub(UserService, 'getUserByEmail').throws(new Error("Error related to searching user with email"));

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'test user',
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(500)

      expect(response.body).to.deep.equal({
        success: false,
        error: 'Unable to register with that email'
      })
    });

    it('should return 400 for existing account', async () => {     
      sinon.stub(UserService, 'getUserByEmail').resolves({
        _id: 'existing_id',
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'hashed_password',
        isEmailVerified: true
      } as IUser); 

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'test user',
          email: 'existing@example.com',
          password: 'password123'
        })
        .expect(400)

      expect(response.body).to.deep.equal({
        success: false,
        error: 'Email already exists. Please try logging in instead'
      })
    });

    it('should return 500 for failed register', async () => {        
      sinon.stub(UserService, 'getUserByEmail').resolves(null);
      sinon.stub(AuthService, 'register').throws(new Error("Unknown error in register"))

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'test user',
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(500)

      expect(response.body).to.deep.equal({
        success: false,
        error: 'Registration failed. Please try again'
      })
    });

    it('should return 201 on successful register', async () => {
      const fakeUser = {
        _id: 'test user id',
        name: 'test user',
        email: 'test@example.com',
        isEmailVerified: true,
        verificationToken: 'test token',
        verificationTokenExpires: (new Date(Date.now() + 24 * 60 * 60 * 1000)).toISOString(),
        createdAt: (new Date()).toISOString(),
        updatedAt: (new Date()).toISOString(),
      }

      sinon.stub(UserService, 'getUserByEmail').resolves(null);
      sinon.stub(AuthService, 'register').resolves({
        token: '123abc',
        user: fakeUser as unknown as Partial<IUser>
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'test user',
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(201)

      expect(response.body).to.deep.equal({
        success: true,
        message: 'Registration successful! Your account has been created and verified',
        data: fakeUser,
        token: '123abc'
      })
    });
  })  

  describe('/api/auth/login POST', () => {
    it('should return 400 for missing email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'hashed-password'
        })
        .expect(400)

      expect(response.body).to.deep.equal({
        success: false,
        error: "Email and password are required"
      })
    })

    it('should return 400 for missing password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: "test@example.com"
        })
        .expect(400)

      expect(response.body).to.deep.equal({
        success: false,
        error: "Email and password are required"
      })
    })

    it('should return 400 for non string email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 123,
          password: 'test-hash'
        })
        .expect(400)

      expect(response.body).to.deep.equal({
        success: false,
        error: "Email and password must be strings"
      })
    })

    it('should return 400 for non string password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 123
        })
        .expect(400)

      expect(response.body).to.deep.equal({
        success: false,
        error: "Email and password must be strings"
      })
    })

    it('should return 401 for bad email', async () => {
      sinon.stub(UserService, 'getUserByEmail').resolves(null);
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'test-hash'
        })
        .expect(401)

      expect(response.body).to.deep.equal({
        success: false,
        error: "Invalid email or password"
      })
    })

    it('should return 401 for unverified email', async () => {
      const unverifiedUser = {
        name: 'test name',
        email: 'test@example.com',
        password: 'test-hash',
        isEmailVerified: false
      }
      sinon.stub(UserService, 'getUserByEmail').resolves(unverifiedUser);
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'test-hash'
        })
        .expect(401)

      expect(response.body).to.deep.equal({
        success: false,
        error: "Please verify your email before logging in"
      })
    })

    it('should return 500 for unknown error during login', async () => {
      const userWithPassword = {
        _id: 'test_id',
        email: 'test@example.com',
        password: 'test-hash',
        isEmailVerified: true
      }

      sinon.stub(UserService, 'getUserByEmail').resolves(userWithPassword);
      sinon.stub(AuthService, 'login').throws(new Error("Some error during login"));

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'test-hash'
        })
        .expect(500)

      expect(response.body).to.deep.equal({
        success: false,
        error: "Invalid Login Error"
      })
    })

    it('should return 200 with token and user for successful login', async () => {
      const userWithPassword = {
        email: 'test@example.com',
        password: 'hashed-password',
        isEmailVerified: true,
      };    
      const {
        password, 
        ...userWithoutPassword
      } = userWithPassword

      sinon.stub(UserService, 'getUserByEmail').resolves(userWithPassword);
      sinon.stub(AuthService, 'login').resolves({
        token: 'token123',
        user: userWithoutPassword
      })

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'hashed-password'
        })
        .expect(200)

      expect(response.body).to.deep.equal({
        success: true,
        message: 'Login successful',
        user: userWithoutPassword,
        token: 'token123'
      })
    })
  });
});

