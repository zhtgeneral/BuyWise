import { describe, beforeEach, beforeAll, afterEach, it, expect } from 'vitest';
import sinon from 'sinon';
import express from 'express';
import request from 'supertest'

import { UserService } from '../../services/UserService';
import profileRouter from '../../routes/profile';
import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import { ProfileService } from '../../services/ProfileService';

process.env.JWT_SECRET = "test-secret";

describe('Profile API', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/profiles', profileRouter);    
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('/api/profiles/verify/:token GET', () => {
    it('should return 400 for missing token', async () => {
      const response = await request(app)
        .get('/api/profiles/verify')
        .query({})
        .expect(400)

      expect(response.body).to.deep.equal({
        success: false,
        error: 'token missing from params'
      })
    });

    it('should return 500 for failing to get user', async () => {
      sinon.stub(UserService, 'getUserByToken').throws(new Error("Some error related to getting user"));

      const response = await request(app)
        .get('/api/profiles/verify/test123')
        .expect(500)

      expect(response.body).to.deep.equal({
        success: false,
        error: 'Unable to get user'
      })
    });

    it('should return 404 for not finding valid user', async () => {
      sinon.stub(UserService, 'getUserByToken').resolves(null);

      const response = await request(app)
        .get('/api/profiles/verify/test123')
        .expect(404)

      expect(response.body).to.deep.equal({
        success: false,
        error: 'Invalid or expired verification token'
      })
    });

    it('should return 500 for failing to verify email', async () => {
      const fakeDate = (new Date()).toISOString();
      const fakeUser = {
        name: 'test name',
        email: 'test@example.com',
        isEmailVerified: true,
        verificationToken: 'test123',
        verificationTokenExpires: fakeDate,
        createdAt: fakeDate,
        updatedAt: fakeDate,
      }
      sinon.stub(UserService, 'getUserByToken').resolves(fakeUser);
      sinon.stub(UserService, 'verifyEmail').throws(new Error("Some error related to verifying email"))

      const response = await request(app)
        .get('/api/profiles/verify/test123')
        .expect(500)

      expect(response.body).to.deep.equal({
        success: false,
        error: 'Unable to verify email'
      })
    });

    it('should return 200 for successfully verifying email', async () => {
      const fakeDate = (new Date()).toISOString();
      const fakeUser = {
        name: 'test name',
        email: 'test@example.com',
        isEmailVerified: true,
        verificationToken: 'test123',
        verificationTokenExpires: fakeDate,
        createdAt: fakeDate,
        updatedAt: fakeDate,
      }
      sinon.stub(UserService, 'getUserByToken').resolves(fakeUser);
      sinon.stub(UserService, 'verifyEmail').resolves();

      const response = await request(app)
        .get('/api/profiles/verify/test123')
        .expect(200)

      expect(response.body).to.deep.equal({
        success: true,
        message: 'Email verified successfully'
      })
    });
  });

  describe('/api/profiles/resend-verification POST', () => {
    it('should return 400 for missing email', async () => {
      const response = await request(app)
        .post('/api/profiles/resend-verification')
        .send({})
        .expect(400)

      expect(response.body).to.deep.equal({
        success: false,
        error: 'email is required'
      })
    });

    it('should return 400 for non string email', async () => {
      const response = await request(app)
        .post('/api/profiles/resend-verification')
        .send({ email: 123 })
        .expect(400)

      expect(response.body).to.deep.equal({
        success: false,
        error: 'email must be a string'
      })
    });

    it('should return 500 for unknown error while getting user', async () => {
      sinon.stub(UserService, 'getUserByEmail').throws(new Error("Some error related to getting user"));

      const response = await request(app)
        .post('/api/profiles/resend-verification')
        .send({ email: 'test@example.com' })
        .expect(500)

      expect(response.body).to.deep.equal({
        success: false,
        error: 'Unable to get user while verifying email'
      })
    })

    it('should return 404 for unknown user', async () => {
      sinon.stub(UserService, 'getUserByEmail').resolves(null);

      const response = await request(app)
        .post('/api/profiles/resend-verification')
        .send({ email: 'test@example.com' })
        .expect(404)

      expect(response.body).to.deep.equal({
        success: false,
        error: 'user cannot be found'
      })
    })

    it('should return 400 for user with verified email', async () => {
      const fakeUserWithoutPassword = {
        _id: 'existing_id',
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'hashed_password',
        isEmailVerified: true
      }
      sinon.stub(UserService, 'getUserByEmail').resolves(fakeUserWithoutPassword);

      const response = await request(app)
        .post('/api/profiles/resend-verification')
        .send({ email: 'test@example.com' })
        .expect(400)

      expect(response.body).to.deep.equal({
        success: false,
        error: 'email is already verified'
      })
    })

    it('should return 500 for unknown error during resending verification email', async () => {
      const fakeUserWithoutPassword = {
        _id: 'existing_id',
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'hashed_password',
        isEmailVerified: false
      }
      sinon.stub(UserService, 'getUserByEmail').resolves(fakeUserWithoutPassword);
      sinon.stub(UserService, 'resendVerificationEmail').throws(new Error("Some error related to resending verification email"));
      
      const response = await request(app)
        .post('/api/profiles/resend-verification')
        .send({ email: 'test@example.com' })
        .expect(500)

      expect(response.body).to.deep.equal({
        success: false,
        error: 'Unable to resend verification email'
      })
    })

    it('should return 200 for successfully resending email', async () => {
      const fakeUserWithoutPassword = {
        _id: 'existing_id',
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'hashed_password',
        isEmailVerified: false
      }
      sinon.stub(UserService, 'getUserByEmail').resolves(fakeUserWithoutPassword);
      sinon.stub(UserService, 'resendVerificationEmail').resolves();
      
      const response = await request(app)
        .post('/api/profiles/resend-verification')
        .send({ email: 'test@example.com' })
        .expect(200)

      expect(response.body).to.deep.equal({
        success: true,
        message: 'Verification email sent'
      })
    })   
  });  

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
      sinon.stub(jwt, 'verify').resolves();    
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
      sinon.stub(jwt, 'verify').resolves();    
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
      const fakeProfile = {
        _id: 'test id',
        userId: 'test userId',
        name: 'Test User',
        country: 'Canada',
        max_products_per_search: 5,
        price_sort_preference: 'lowest_first',
        allow_ai_personalization: true,
        response_style: 'conversational',
        minimum_rating_threshold: 4,
        exclude_unrated_products: false,
        createdAt: (new Date()).toISOString(),
        updatedAt: (new Date()).toISOString(),
        email: 'test@example.com',
      }

      sinon.stub(jwt, 'verify').resolves();    
      sinon.stub(ProfileService, 'getProfileByUserId').resolves(fakeProfile);

      const response = await request(app)
        .get('/api/profiles/userId123')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200)

      expect(response.body).to.deep.equal({
        success: true,
        message: 'Successfully retrieved profile',
        profile: fakeProfile
      })
    });    
  });

  describe('/api/profiles/:userId PATCH', () => {
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
        .patch('/api/profiles/')
        .expect(401)

      expect(response.body).to.deep.equal({
        success: false,
        error: 'No auth token in header'
      })
    });

    it('should return 500 for unconfigured JWT', async () => {
      delete process.env.JWT_SECRET;
      const response = await request(app)
        .patch('/api/profiles/userId123')
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
        .patch('/api/profiles/userId123')
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
        .patch('/api/profiles/userId123')
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
        .patch('/api/profiles/')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(400)

      expect(response.body).to.deep.equal({
        success: false,
        error: 'userId missing from params'
      })
    });

    it('should return 400 for missing profileData in body', async () => {
      sinon.stub(jwt, 'verify').resolves();

      const response = await request(app)
        .patch('/api/profiles/userId123')
        .send({ profileData: null })
        .set('Authorization', `Bearer ${validToken}`)
        .expect(400)

      expect(response.body).to.deep.equal({
        success: false,
        error: 'profileData missing from body'
      })
    });

    it('should return 500 for error during getting profile', async () => {
      const fakeProfileData = {
        _id: 'test id',
        userId: 'test userId',
        name: 'Test User',
        country: 'Canada',
        max_products_per_search: 5,
        price_sort_preference: 'highest_first',
        allow_ai_personalization: true,
        response_style: 'conversational',
        minimum_rating_threshold: 4,
        exclude_unrated_products: false,
        createdAt: (new Date()).toISOString(),
        updatedAt: (new Date()).toISOString(),
        email: 'test@example.com',
      }

      sinon.stub(jwt, 'verify').resolves();    
      sinon.stub(ProfileService, 'getProfileByUserId').throws(new Error("Some error related to getting user"));

      const response = await request(app)
        .patch('/api/profiles/userId123')
        .send({ profileData: fakeProfileData })
        .set('Authorization', `Bearer ${validToken}`)
        .expect(500)

      expect(response.body).to.deep.equal({
        success: false,
        error: 'Unknown error during getting profile'
      })
    })

    it('should return 404 for missing profile for userId', async () => {
      sinon.stub(jwt, 'verify').resolves();    
      sinon.stub(ProfileService, 'getProfileByUserId').resolves(null);

      const fakeProfileData = {
        _id: 'test id',
        userId: 'test userId',
        name: 'Test User',
        country: 'Canada',
        max_products_per_search: 5,
        price_sort_preference: 'highest_first',
        allow_ai_personalization: true,
        response_style: 'conversational',
        minimum_rating_threshold: 4,
        exclude_unrated_products: false,
        createdAt: (new Date()).toISOString(),
        updatedAt: (new Date()).toISOString(),
        email: 'test@example.com',
      }

      const response = await request(app)
        .patch('/api/profiles/userId123')
        .send({ profileData: fakeProfileData })
        .set('Authorization', `Bearer ${validToken}`)
        .expect(404)

      expect(response.body).to.deep.equal({
        success: false,
        error: 'No profile found'
      })
    });

    it('should return 500 for error with updating profile', async () => {
      const fakeProfileData = {
        _id: 'test id',
        userId: 'test userId',
        name: 'Test User',
        country: 'US',
        max_products_per_search: 8,
        price_sort_preference: 'lowest_first',
        allow_ai_personalization: false,
        response_style: 'technical',
        minimum_rating_threshold: 5,
        exclude_unrated_products: true,
        createdAt: (new Date()).toISOString(),
        updatedAt: (new Date()).toISOString(),
        email: 'test@example.com',
      }
      const existingProfileData = {
        _id: 'test id',
        userId: 'test userId',
        name: 'Test User',
        country: 'Canada',
        max_products_per_search: 3,
        price_sort_preference: 'highest_first',
        allow_ai_personalization: true,
        response_style: 'conversational',
        minimum_rating_threshold: 3,
        exclude_unrated_products: false,
        createdAt: (new Date()).toISOString(),
        updatedAt: (new Date()).toISOString(),
        email: 'test@example.com',
      }

      sinon.stub(jwt, 'verify').resolves();    
      sinon.stub(ProfileService, 'getProfileByUserId').resolves(existingProfileData);
      sinon.stub(ProfileService, 'updateProfile').throws(new Error("Some error related to updating profile"));
      
      const response = await request(app)
        .patch('/api/profiles/userId123')
        .send({ profileData: fakeProfileData })
        .set('Authorization', `Bearer ${validToken}`)
        .expect(500)

      expect(response.body).to.deep.equal({
        success: false,
        error: 'Unable to update profile'
      })
    })

    it('should return 200 for successfully updating profile', async () => {
      const fakeProfileData = {
        _id: 'test id',
        userId: 'userId123',
        name: 'Test User',
        country: 'US',
        max_products_per_search: 8,
        price_sort_preference: 'lowest_first',
        allow_ai_personalization: false,
        response_style: 'technical',
        minimum_rating_threshold: 5,
        exclude_unrated_products: true,
        createdAt: (new Date()).toISOString(),
        updatedAt: (new Date()).toISOString(),
        email: 'test@example.com',
      }
      const existingProfileData = {
        _id: 'test id',
        userId: 'userId123',
        name: 'Test User',
        country: 'Canada',
        max_products_per_search: 3,
        price_sort_preference: 'lowest_first',
        allow_ai_personalization: true,
        response_style: 'conversational',
        minimum_rating_threshold: 3,
        exclude_unrated_products: false,
        createdAt: (new Date()).toISOString(),
        updatedAt: (new Date()).toISOString(),
        email: 'test@example.com',
      }

      sinon.stub(jwt, 'verify').resolves();    
      sinon.stub(ProfileService, 'getProfileByUserId').resolves(existingProfileData);
      sinon.stub(ProfileService, 'updateProfile').resolves(fakeProfileData);
      
      const response = await request(app)
        .patch('/api/profiles/userId123')
        .send({ profileData: fakeProfileData })
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200)

      expect(response.body).to.deep.equal({
        success: true,
        message: 'Profile updated successfully',
        data: fakeProfileData
      })
    })    
  });

  describe('/api/profiles/passwords/:userId', () => {
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
        .patch('/api/profiles/passwords')
        .expect(401)

      expect(response.body).to.deep.equal({
        success: false,
        error: 'No auth token in header'
      })
    });

    it('should return 500 for unconfigured JWT', async () => {
      delete process.env.JWT_SECRET;
      const response = await request(app)
        .patch('/api/profiles/passwords/userId123')
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
        .patch('/api/profiles/passwords/userId123')
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
        .patch('/api/profiles/passwords/userId123')
        .set('Authorization', `Bearer sometoken`)
        .expect(500)

      expect(response.body).to.deep.equal({
        success: false,
        error: 'Unknown error'
      })
    });

    it('should return 400 for userId missing from params', async () => {
      sinon.stub(jwt, 'verify').resolves();

      const response = await request(app)
        .patch('/api/profiles/passwords')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(400)      

      expect(response.body).to.deep.equal({
        success: false,
        error: 'userId missing from params'
      })
    })

    it('should return 400 for missing newPassword', async () => {
      sinon.stub(jwt, 'verify').resolves();

      const response = await request(app)
        .patch('/api/profiles/passwords/test123')
        .send({
          currentPassword: 'currentPassword'
        })
        .set('Authorization', `Bearer ${validToken}`)
        .expect(400)      

      expect(response.body).to.deep.equal({
        success: false,
        error: 'currentPassword and newPassword required'
      })
    })

    it('should return 400 for missing currentPassword', async () => {
      sinon.stub(jwt, 'verify').resolves();

      const response = await request(app)
        .patch('/api/profiles/passwords/test123')
        .send({
          newPassword: 'newPassword'
        })
        .set('Authorization', `Bearer ${validToken}`)
        .expect(400)

      expect(response.body).to.deep.equal({
        success: false,
        error: 'currentPassword and newPassword required'
      })
    })

    it('should return 400 for non string currentPassword', async () => {
      sinon.stub(jwt, 'verify').resolves();

      const response = await request(app)
        .patch('/api/profiles/passwords/test123')
        .send({
          currentPassword: 123,
          newPassword: 'newPassword'
        })
        .set('Authorization', `Bearer ${validToken}`)
        .expect(400)      

      expect(response.body).to.deep.equal({
        success: false,
        error: 'currentPassword and newPassword need to be strings'
      })
    })

    it('should return 400 for non string currentPassword', async () => {
      sinon.stub(jwt, 'verify').resolves();

      const response = await request(app)
        .patch('/api/profiles/passwords/test123')
        .send({
          currentPassword: 'test current',
          newPassword: 123
        })
        .set('Authorization', `Bearer ${validToken}`)
        .expect(400)      

      expect(response.body).to.deep.equal({
        success: false,
        error: 'currentPassword and newPassword need to be strings'
      })
    })

    it('should return 500 for unknown error during getting user', async () => {
      sinon.stub(jwt, 'verify').resolves();
      sinon.stub(UserService, 'getUserById').throws(new Error('Some error during fetching user'));

      const response = await request(app)
        .patch('/api/profiles/passwords/userId123')
        .send({
          currentPassword: 'test current',
          newPassword: 'test new'
        })
        .set('Authorization', `Bearer ${validToken}`)
        .expect(500)

      expect(response.body).to.deep.equal({
        success: false,
        error: 'Unknown error during getting user'
      })
    })

    it('should return 404 for unknown user', async () => {
      sinon.stub(jwt, 'verify').resolves();    
      sinon.stub(UserService, 'getUserById').resolves(null);

      const response = await request(app)
        .patch('/api/profiles/passwords/userId123')
        .send({
          currentPassword: 'test current',
          newPassword: 'test new'
        })
        .set('Authorization', `Bearer ${validToken}`)
        .expect(404)

      expect(response.body).to.deep.equal({
        success: false,
        error: 'No user found'
      })
    })

    it('should return 401 for invalid currentPassword', async () => {
      const userWithPassword = {
        name: 'test name',
        email: 'test@example.com',
        password: 'test1234',
        isEmailVerified: true,
        verificationToken: 'test token',
        verificationTokenExpires: (new Date()).toISOString(),
        createdAt: (new Date()).toISOString(),
        updatedAt: (new Date()).toISOString(),
      }

      sinon.stub(jwt, 'verify').resolves();      
      sinon.stub(UserService, 'getUserById').resolves(userWithPassword);
      sinon.stub(UserService, 'comparePassword').resolves(false);

      const response = await request(app)
        .patch('/api/profiles/passwords/userId123')
        .send({
          currentPassword: 'test4321',
          newPassword: 'test new'
        })
        .set('Authorization', `Bearer ${validToken}`)
        .expect(401)

      expect(response.body).to.deep.equal({
        success: false,
        error: 'Password incorrect'
      })
    })

    it('should return 500 for failed password update', async () => {
      const userWithPassword = {
        name: 'test name',
        email: 'test@example.com',
        password: 'test1234',
        isEmailVerified: true,
        verificationToken: 'test token',
        verificationTokenExpires: (new Date()).toISOString(),
        createdAt: (new Date()).toISOString(),
        updatedAt: (new Date()).toISOString(),
      }

      sinon.stub(jwt, 'verify').resolves();
      sinon.stub(UserService, 'getUserById').resolves(userWithPassword);
      sinon.stub(UserService, 'comparePassword').resolves(true);
      sinon.stub(UserService, 'updatePassword').throws(new Error("Some error related to updating password"))

      const response = await request(app)
        .patch('/api/profiles/passwords/userId123')
        .send({
          currentPassword: 'test1234',
          newPassword: 'test new'
        })
        .set('Authorization', `Bearer ${validToken}`)
        .expect(500)

      expect(response.body).to.deep.equal({
        success: false,
        error: 'Unable to update password'
      })
    })

    it('should return 200 for successful password update', async () => {
      const userWithPassword = {
        name: 'test name',
        email: 'test@example.com',
        password: 'test1234',
        isEmailVerified: true,
        verificationToken: 'test token',
        verificationTokenExpires: (new Date()).toISOString(),
        createdAt: (new Date()).toISOString(),
        updatedAt: (new Date()).toISOString(),
      }

      sinon.stub(jwt, 'verify').resolves();
      sinon.stub(UserService, 'getUserById').resolves(userWithPassword);
      sinon.stub(UserService, 'comparePassword').resolves(true);
      sinon.stub(UserService, 'updatePassword').resolves();

      const response = await request(app)
        .patch('/api/profiles/passwords/userId123')
        .send({
          currentPassword: 'test1234',
          newPassword: 'test new'
        })
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200)

      expect(response.body).to.deep.equal({
        success: true,
        message: 'Password updated successfully'
      })
    })
  })
});

