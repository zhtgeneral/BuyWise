import sinon from 'sinon';
import { expect } from 'chai';
import express from 'express';
import request from 'supertest'

import { UserService } from '../../services/UserService';
import profileRouter from '../../routes/profile';
import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import { ProfileService } from '../../services/ProfileService';

process.env.JWT_SECRET = "test-secret";

describe('Profile API', () => {
  let app: express.Express;
  
  before(() => {
    app = express();
    app.use(express.json());
    app.use('/api/profiles', profileRouter);    
  });

  afterEach(() => {
    sinon.restore();
  });

  // describe('/api/profiles/verify/:token GET', () => {
  //   it('should return 400 for missing token', async () => {
  //     const response = await request(app)
  //       .get('/api/profiles/verify')
  //       .query({})
  //       .expect(400)

  //     expect(response.body).to.deep.equal({
  //       success: false,
  //       error: 'token missing from params'
  //     })
  //   });

  //   it('should return 500 for failing to get user', async () => {
  //     sinon.stub(UserService, 'getUserByToken').throws(new Error("Some error related to getting user"));

  //     const response = await request(app)
  //       .get('/api/profiles/verify/test123')
  //       .expect(500)

  //     expect(response.body).to.deep.equal({
  //       success: false,
  //       error: 'Unable to get user'
  //     })
  //   });

  //   it('should return 404 for not finding valid user', async () => {
  //     sinon.stub(UserService, 'getUserByToken').resolves(null);

  //     const response = await request(app)
  //       .get('/api/profiles/verify/test123')
  //       .expect(404)

  //     expect(response.body).to.deep.equal({
  //       success: false,
  //       error: 'Invalid or expired verification token'
  //     })
  //   });

  //   it('should return 500 for failing to verify email', async () => {
  //     const fakeDate = new Date()
  //     const fakeUser = {
  //       name: 'test name',
  //       email: 'test@example.com',
  //       isEmailVerified: true,
  //       verificationToken: 'test123',
  //       verificationTokenExpires: fakeDate,
  //       createdAt: fakeDate,
  //       updatedAt: fakeDate,
  //     }
  //     sinon.stub(UserService, 'getUserByToken').resolves(fakeUser);
  //     sinon.stub(UserService, 'verifyEmail').throws(new Error("Some error related to verifying email"))

  //     const response = await request(app)
  //       .get('/api/profiles/verify/test123')
  //       .expect(500)

  //     expect(response.body).to.deep.equal({
  //       success: false,
  //       error: 'Unable to verify email'
  //     })
  //   });

  //   it('should return 200 for successfully verifying email', async () => {
  //     const fakeDate = new Date()
  //     const fakeUser = {
  //       name: 'test name',
  //       email: 'test@example.com',
  //       isEmailVerified: true,
  //       verificationToken: 'test123',
  //       verificationTokenExpires: fakeDate,
  //       createdAt: fakeDate,
  //       updatedAt: fakeDate,
  //     }
  //     sinon.stub(UserService, 'getUserByToken').resolves(fakeUser);
  //     sinon.stub(UserService, 'verifyEmail').resolves();

  //     const response = await request(app)
  //       .get('/api/profiles/verify/test123')
  //       .expect(200)

  //     expect(response.body).to.deep.equal({
  //       success: true,
  //       message: 'Email verified successfully'
  //     })
  //   });
  // });

  // describe('/api/profiles/resend-verification POST', () => {
  //   it('should return 400 for missing email', async () => {
  //     const response = await request(app)
  //       .post('/api/profiles/resend-verification')
  //       .send({})
  //       .expect(400)

  //     expect(response.body).to.deep.equal({
  //       success: false,
  //       error: 'email is required'
  //     })
  //   });

  //   it('should return 400 for non string email', async () => {
  //     const response = await request(app)
  //       .post('/api/profiles/resend-verification')
  //       .send({ email: 123 })
  //       .expect(400)

  //     expect(response.body).to.deep.equal({
  //       success: false,
  //       error: 'email must be a string'
  //     })
  //   });

  //   it('should return 500 for unknown error while getting user', async () => {
  //     sinon.stub(UserService, 'getUserByEmail').throws(new Error("Some error related to getting user"));

  //     const response = await request(app)
  //       .post('/api/profiles/resend-verification')
  //       .send({ email: 'test@example.com' })
  //       .expect(500)

  //     expect(response.body).to.deep.equal({
  //       success: false,
  //       error: 'Unable to get user while verifying email'
  //     })
  //   })

  //   it('should return 404 for unknown user', async () => {
  //     sinon.stub(UserService, 'getUserByEmail').resolves(null);

  //     const response = await request(app)
  //       .post('/api/profiles/resend-verification')
  //       .send({ email: 'test@example.com' })
  //       .expect(404)

  //     expect(response.body).to.deep.equal({
  //       success: false,
  //       error: 'user cannot be found'
  //     })
  //   })

  //   it('should return 400 for user with verified email', async () => {
  //     const fakeUserWithoutPassword = {
  //       _id: 'existing_id',
  //       name: 'Existing User',
  //       email: 'existing@example.com',
  //       password: 'hashed_password',
  //       isEmailVerified: true
  //     }
  //     sinon.stub(UserService, 'getUserByEmail').resolves(fakeUserWithoutPassword);

  //     const response = await request(app)
  //       .post('/api/profiles/resend-verification')
  //       .send({ email: 'test@example.com' })
  //       .expect(400)

  //     expect(response.body).to.deep.equal({
  //       success: false,
  //       error: 'email is already verified'
  //     })
  //   })

  //   it('should return 500 for unknown error during resending verification email', async () => {
  //     const fakeUserWithoutPassword = {
  //       _id: 'existing_id',
  //       name: 'Existing User',
  //       email: 'existing@example.com',
  //       password: 'hashed_password',
  //       isEmailVerified: false
  //     }
  //     sinon.stub(UserService, 'getUserByEmail').resolves(fakeUserWithoutPassword);
  //     sinon.stub(UserService, 'resendVerificationEmail').throws(new Error("Some error related to resending verification email"));
      
  //     const response = await request(app)
  //       .post('/api/profiles/resend-verification')
  //       .send({ email: 'test@example.com' })
  //       .expect(500)

  //     expect(response.body).to.deep.equal({
  //       success: false,
  //       error: 'Unable to resend verification email'
  //     })
  //   })

  //   it('should return 200 for successfully resending email', async () => {
  //     const fakeUserWithoutPassword = {
  //       _id: 'existing_id',
  //       name: 'Existing User',
  //       email: 'existing@example.com',
  //       password: 'hashed_password',
  //       isEmailVerified: false
  //     }
  //     sinon.stub(UserService, 'getUserByEmail').resolves(fakeUserWithoutPassword);
  //     sinon.stub(UserService, 'resendVerificationEmail').resolves();
      
  //     const response = await request(app)
  //       .post('/api/profiles/resend-verification')
  //       .send({ email: 'test@example.com' })
  //       .expect(200)

  //     expect(response.body).to.deep.equal({
  //       success: true,
  //       message: 'Verification email sent'
  //     })
  //   })   
  // });  

  describe('/api/profiles/:userId GET', () => {
    let originalSecret: string | undefined;

    beforeEach(() => {
      originalSecret = process.env.JWT_SECRET;
    });

    afterEach(() => {
      process.env.JWT_SECRET = originalSecret; // restore
    });

    const validToken = jwt.sign(
      { 
        id: 'testId123'
      }, 
      process.env.JWT_SECRET || 'testsecret'
    );

    it('should return 401 for no auth token on header', async () => {
      const response = await request(app)
        .get('/api/profiles/')
        .expect(401)

      expect(response.body).to.deep.equal({
        success: false,
        error: 'No auth token in header'
      })
    });

    it('should return 500 for unconfigured JWT', async () => {
      delete process.env.JWT_SECRET;
      const response = await request(app)
        .get('/api/profiles/userId123')
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
        .get('/api/profiles/userId123')
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
        .get('/api/profiles/userId123')
        .set('Authorization', `Bearer sometoken`)
        .expect(500)

      expect(response.body).to.deep.equal({
        success: false,
        error: 'Unknown error'
      })
    });

    it('should return 400 for missing userId on params', async () => {
      sinon.stub(jwt, 'verify').resolves();

      const response = await request(app)
        .get('/api/profiles/')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(400)

      expect(response.body).to.deep.equal({
        success: false,
        error: 'userId missing from params'
      })
    });

    it('should return 500 for error during getting profile', async () => {
      /** Physically verify token without mocking */
      sinon.stub(ProfileService, 'getProfileByUserId').throws(new Error("Some error related to getting user"));

      const response = await request(app)
        .get('/api/profiles/userId123')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(500)

      expect(response.body).to.deep.equal({
        success: false,
        error: 'Unknown error during getting profile'
      })
    })

    it('should return 404 for missing profile for userId', async () => {
      /** Physically verify token without mocking */
      sinon.stub(ProfileService, 'getProfileByUserId').resolves(null);

      const response = await request(app)
        .get('/api/profiles/userId123')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(404)

      expect(response.body).to.deep.equal({
        success: false,
        error: 'Unable to get profile with userId'
      })
    });

    it('should return 200 for successfully getting profile', async () => {
      /** Physically verify token without mocking */
      const fakeProfile = {
        _id: 'test id',
        userId: 'test userId',        
        storage_preference: '123GB',
        RAM_preference: '8GB',
        brand_preference: 'Apple, Samsung, Sony',        
        min_budget: 50,
        max_budget: 500,
        rating_preference: 5,
        country: 'Canada',
        address: {
          street: 'test street',
          city: 'test city',
          state: 'test state',
          zipCode: 'test zip code',
          country: 'test country',
        },
        createdAt: (new Date()).toISOString(),
        updatedAt: (new Date()).toISOString(),
        email: 'test@example.com',
      }
      sinon.stub(ProfileService, 'getProfileByUserId').resolves(fakeProfile);

      const response = await request(app)
        .get('/api/profiles/userId123')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200)

      expect(response.body).to.deep.equal({
        success: true,
        message: 'Successfully retrieved profile',
        data: fakeProfile
      })
    });
    
  });
});

