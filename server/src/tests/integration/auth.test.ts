import sinon from 'sinon';
import { expect } from 'chai';
import express from 'express';
import request from 'supertest'
import jwt, { JwtPayload } from 'jsonwebtoken';

import { AuthService } from '../../services/authService';
import User, { IUser } from '../../models/User';
import authRoutes from '../../routes/auth';

process.env.JWT_SECRET = "test-secret";

describe('Auth API', () => {
  let app: express.Express;
  
  before(() => {
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
      sinon.stub(User, 'findOne').throws(new Error("Error related to searching user with email"));

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
        error: 'Unable to determine validity of email'
      })
    });

    it('should return 400 for existing account', async () => {     
      sinon.stub(User, 'findOne').resolves({
        _id: 'existing_id',
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'hashed_password',
        isEmailVerified: true
      }); 

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
        error: 'Email already exists. Pleast try logging in instead'
      })
    });

    it('should return 500 for failed register', async () => {        
      sinon.stub(User, 'findOne').resolves(null);
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

      sinon.stub(User, 'findOne').resolves(null);
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
      const payload = jwt.verify(response.body.token, process.env.JWT_SECRET || 'your-secret-key') as JwtPayload;
      expect(payload.id).to.be('123abc');
    });
  })
})    

  // TODO fix
  // describe('login', () => {
  //   it('should return token and user when login succeeds', async () => {
  //     const fakeUser = {
  //       email: 'test@example.com',
  //       isEmailVerified: true,
  //       password: 'hashed-password',
  //       comparePassword: sinon.stub().resolves(true),
  //       toObject: () => ({
  //         email: 'test@example.com',
  //         isEmailVerified: true,
  //       }),
  //       _id: '123abc'
  //     };

  //     sinon.stub(UserService, 'getUserByEmail').resolves(fakeUser as any);

  //     const result = await AuthService.login('test@example.com', 'valid-password');

  //     expect(result).to.have.property('token').that.is.a('string');
  //     expect(result.user).to.include({
  //       email: 'test@example.com',
  //       isEmailVerified: true,
  //     });

  //     const payload = jwt.verify(result.token, process.env.JWT_SECRET || 'your-secret-key') as any;
  //     expect(payload).to.have.property('id', '123abc');
  //   });

  //   it('should throw an error when user is not found', async () => {
  //     sinon.stub(UserService, 'getUserByEmail').rejects(new AppError('User not found', 404));
    
  //     try {
  //       await AuthService.login('notfound@example.com', 'any-password');
  //       throw new Error('Expected method to throw.');
  //     } catch (err: any) {
  //       expect(err).to.have.property('message', 'Invalid email or password');
  //       expect(err).to.have.property('statusCode', 401);
  //     }
  //   });
    
  //   it('should throw an error when email is not verified', async () => {
  //     const fakeUser = {
  //       email: 'test@example.com',
  //       isEmailVerified: false,
  //       password: 'hashed-password',
  //       comparePassword: sinon.stub().resolves(true),
  //       toObject: () => ({
  //         email: 'test@example.com',
  //         isEmailVerified: false,
  //       }),
  //       _id: '123abc'
  //     };

  //     sinon.stub(UserService, 'getUserByEmail').resolves(fakeUser as any);

  //     try {
  //       await AuthService.login('test@example.com', 'valid-password');
  //       throw new Error('Expected method to throw.');
  //     } catch (err: any) {
  //       expect(err).to.be.instanceOf(AppError);
  //       expect(err.message).to.equal('Please verify your email before logging in');
  //       expect(err.statusCode).to.equal(401);
  //     }
  //   });

  //   it('should throw an error when password is invalid', async () => {
  //     const fakeUser = {
  //       email: 'test@example.com',
  //       isEmailVerified: true,
  //       password: 'hashed-password',
  //       comparePassword: sinon.stub().resolves(false),
  //       toObject: () => ({
  //         email: 'test@example.com',
  //         isEmailVerified: true,
  //       }),
  //       _id: '123abc'
  //     };

  //     sinon.stub(UserService, 'getUserByEmail').resolves(fakeUser as any);

  //     try {
  //       await AuthService.login('test@example.com', 'wrong-password');
  //       throw new Error('Expected method to throw.');
  //     } catch (err: any) {
  //       expect(err).to.be.instanceOf(AppError);
  //       expect(err.message).to.equal('Invalid email or password');
  //       expect(err.statusCode).to.equal(401);
  //     }
  //   });

  //   it('should throw an error if password field is missing', async () => {
  //     const fakeUser = {
  //       email: 'test@example.com',
  //       isEmailVerified: true,
  //       comparePassword: sinon.stub().resolves(false),
  //       toObject: () => ({
  //         email: 'test@example.com',
  //         isEmailVerified: true,
  //       }),
  //       _id: '123abc'
  //     };

  //     sinon.stub(UserService, 'getUserByEmail').resolves(fakeUser as any);

  //     try {
  //       await AuthService.login('test@example.com', 'any-password');
  //       throw new Error('Expected method to throw.');
  //     } catch (err: any) {
  //       expect(err).to.be.instanceOf(AppError);
  //       expect(err.message).to.equal('Invalid email or password');
  //       expect(err.statusCode).to.equal(401);
  //     }
  //   });
  // });
// });

