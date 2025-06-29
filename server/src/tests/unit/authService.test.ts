// import sinon from 'sinon';
// import { expect } from 'chai';
// import jwt from 'jsonwebtoken';
// process.env.JWT_SECRET = "test-secret";
// import { AuthService } from '../../services/authService';
// import { UserService } from '../../services/UserService';
// import { ProfileService } from '../../services/ProfileService';
// import { AppError } from '../../utils/AppError';
// import express from 'express';

// // TODO this has bugs Error: Timeout of 10000ms exceeded. For async tests and hooks, ensure "done()" is called; if returning a Promise, ensure it resolves. (...\team10\server\src\tests\unit\authService.test.ts)// 

// describe('authService', () => {
//   afterEach(() => {
//     sinon.restore();
//   });

//   describe('register', () => {
//     it('should return token and user when registration succeeds', async () => {
//       const fakeUser = {
//         name: 'Test User',
//         email: 'test@example.com',
//         isEmailVerified: true,
//         toObject: () => ({
//           name: 'Test User',
//           email: 'test@example.com',
//           isEmailVerified: true,
//         }),
//         _id: '123abc'
//       };

//       const fakeProfile = {
//         userId: '123abc',
//         storage_preference: 'none',
//         RAM_preference: 'none',
//         brand_preference: '',
//         min_budget: 100,
//         max_budget: 1000,
//         rating_preference: 3,
//         country: 'Canada'
//       };

//       sinon.stub(UserService, 'createUser').resolves(fakeUser as any);
//       sinon.stub(ProfileService, 'createProfile').resolves(fakeProfile as any);

//       const result = await AuthService.register('Test User', 'test@example.com', 'password123');

//       expect(result).to.have.property('token').that.is.a('string');
//       expect(result.user).to.include({
//         name: 'Test User',
//         email: 'test@example.com',
//         isEmailVerified: true,
//       });

//       const payload = jwt.verify(result.token, process.env.JWT_SECRET || 'your-secret-key') as any;
//       expect(payload).to.have.property('id', '123abc');
//     });

//     it('should throw an error when UserService.createUser fails', async () => {
//       sinon.stub(UserService, 'createUser').rejects(new AppError('Email already exists', 400));

//       try {
//         await AuthService.register('Test User', 'test@example.com', 'password123');
//         throw new Error('Expected method to throw.');
//       } catch (err: any) {
//         expect(err).to.be.instanceOf(AppError);
//         expect(err.message).to.equal('Email already exists');
//         expect(err.statusCode).to.equal(400);
//       }
//     });

//     it('should throw an error when ProfileService.createProfile fails', async () => {
//       const fakeUser = {
//         name: 'Test User',
//         email: 'test@example.com',
//         isEmailVerified: true,
//         toObject: () => ({
//           name: 'Test User',
//           email: 'test@example.com',
//           isEmailVerified: true,
//         }),
//         _id: '123abc'
//       };

//       sinon.stub(UserService, 'createUser').resolves(fakeUser as any);
//       sinon.stub(ProfileService, 'createProfile').rejects(new AppError('Profile creation failed', 500));

//       try {
//         await AuthService.register('Test User', 'test@example.com', 'password123');
//         throw new Error('Expected method to throw.');
//       } catch (err: any) {
//         expect(err).to.be.instanceOf(AppError);
//         expect(err.message).to.equal('Profile creation failed');
//         expect(err.statusCode).to.equal(500);
//       }
//     });
//   });

//   // TODO fix
//   describe('login', () => {
//     it('should return token and user when login succeeds', async () => {
//       const fakeUser = {
//         email: 'test@example.com',
//         isEmailVerified: true,
//         password: 'hashed-password',
//         comparePassword: sinon.stub().resolves(true),
//         toObject: () => ({
//           email: 'test@example.com',
//           isEmailVerified: true,
//         }),
//         _id: '123abc'
//       };

//       sinon.stub(UserService, 'getUserByEmail').resolves(fakeUser as any);

//       const result = await AuthService.login('test@example.com', 'valid-password');

//       expect(result).to.have.property('token').that.is.a('string');
//       expect(result.user).to.include({
//         email: 'test@example.com',
//         isEmailVerified: true,
//       });

//       const payload = jwt.verify(result.token, process.env.JWT_SECRET || 'your-secret-key') as any;
//       expect(payload).to.have.property('id', '123abc');
//     });

//     it('should throw an error when user is not found', async () => {
//       sinon.stub(UserService, 'getUserByEmail').rejects(new AppError('User not found', 404));
    
//       try {
//         await AuthService.login('notfound@example.com', 'any-password');
//         throw new Error('Expected method to throw.');
//       } catch (err: any) {
//         expect(err).to.have.property('message', 'Invalid email or password');
//         expect(err).to.have.property('statusCode', 401);
//       }
//     });
    
//     it('should throw an error when email is not verified', async () => {
//       const fakeUser = {
//         email: 'test@example.com',
//         isEmailVerified: false,
//         password: 'hashed-password',
//         comparePassword: sinon.stub().resolves(true),
//         toObject: () => ({
//           email: 'test@example.com',
//           isEmailVerified: false,
//         }),
//         _id: '123abc'
//       };

//       sinon.stub(UserService, 'getUserByEmail').resolves(fakeUser as any);

//       try {
//         await AuthService.login('test@example.com', 'valid-password');
//         throw new Error('Expected method to throw.');
//       } catch (err: any) {
//         expect(err).to.be.instanceOf(AppError);
//         expect(err.message).to.equal('Please verify your email before logging in');
//         expect(err.statusCode).to.equal(401);
//       }
//     });

//     it('should throw an error when password is invalid', async () => {
//       const fakeUser = {
//         email: 'test@example.com',
//         isEmailVerified: true,
//         password: 'hashed-password',
//         comparePassword: sinon.stub().resolves(false),
//         toObject: () => ({
//           email: 'test@example.com',
//           isEmailVerified: true,
//         }),
//         _id: '123abc'
//       };

//       sinon.stub(UserService, 'getUserByEmail').resolves(fakeUser as any);

//       try {
//         await AuthService.login('test@example.com', 'wrong-password');
//         throw new Error('Expected method to throw.');
//       } catch (err: any) {
//         expect(err).to.be.instanceOf(AppError);
//         expect(err.message).to.equal('Invalid email or password');
//         expect(err.statusCode).to.equal(401);
//       }
//     });

//     it('should throw an error if password field is missing', async () => {
//       const fakeUser = {
//         email: 'test@example.com',
//         isEmailVerified: true,
//         comparePassword: sinon.stub().resolves(false),
//         toObject: () => ({
//           email: 'test@example.com',
//           isEmailVerified: true,
//         }),
//         _id: '123abc'
//       };

//       sinon.stub(UserService, 'getUserByEmail').resolves(fakeUser as any);

//       try {
//         await AuthService.login('test@example.com', 'any-password');
//         throw new Error('Expected method to throw.');
//       } catch (err: any) {
//         expect(err).to.be.instanceOf(AppError);
//         expect(err.message).to.equal('Invalid email or password');
//         expect(err.statusCode).to.equal(401);
//       }
//     });
//   });
// });

import sinon from 'sinon';
import { expect } from 'chai';
import express from 'express';
import request from 'supertest'
import jwt, { JwtPayload } from 'jsonwebtoken';

process.env.JWT_SECRET = "test-secret";
import { AuthService } from '../../services/authService';
import { UserService } from '../../services/UserService';
import { ProfileService } from '../../services/ProfileService';
import { AppError } from '../../utils/AppError';
import authRoutes, { postRegister } from '../../routes/auth';

describe('Auth API', () => {
  let app: express.Express;
  
  before(() => {
    app = express();
    app.use(express.json());
    // app.use('/api/auth', authRoutes);
    app.post('/api/auth/register', postRegister);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('/api/auth/register POST', () => {
    it('should return 400 for missing name', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'test name',
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(400)

      expect(response.body).to.deep.equal({
        success: false,
        error: 'name, email and password are required'
      })
    });
  })
})

    // it('should return token and user when registration succeeds', async () => {
    //   const fakeUser = {
    //     name: 'Test User',
    //     email: 'test@example.com',
    //     isEmailVerified: true,
    //     toObject: () => ({
    //       name: 'Test User',
    //       email: 'test@example.com',
    //       isEmailVerified: true,
    //     }),
    //     _id: '123abc'
    //   };

    //   const fakeProfile = {
    //     userId: '123abc',
    //     storage_preference: 'none',
    //     RAM_preference: 'none',
    //     brand_preference: '',
    //     min_budget: 100,
    //     max_budget: 1000,
    //     rating_preference: 3,
    //     country: 'Canada'
    //   };

    //   sinon.stub(UserService, 'createUser').resolves(fakeUser as any);
    //   sinon.stub(ProfileService, 'createProfile').resolves(fakeProfile as any);

    //   const response = await request(app)
    //     .get('/api/auth')
    //     .send({
    //       name: 'test user',
    //       email: 'test@example.com',
    //       password: 'password123'
    //     })

    //   expect(response.status).to.eq(201);
    //   expect(response.body.token).to.be.a('string');
    //   expect(response.body.user).to.include({
    //     name: 'Test User',
    //     email: 'test@example.com',
    //     isEmailVerified: true,
    //   });
    //   const payload = jwt.verify(response.body.token, process.env.JWT_SECRET || 'your-secret-key') as JwtPayload;
    //   expect(payload.id).to.be('123abc');
    // });

    // it('should throw an error when UserService.createUser fails', async () => {
    //   sinon.stub(UserService, 'createUser').rejects(new AppError('Email already exists', 400));

    //   try {
    //     await AuthService.register('Test User', 'test@example.com', 'password123');
    //     throw new Error('Expected method to throw.');
    //   } catch (err: any) {
    //     expect(err).to.be.instanceOf(AppError);
    //     expect(err.message).to.equal('Email already exists');
    //     expect(err.statusCode).to.equal(400);
    //   }
    // });

    // it('should throw an error when ProfileService.createProfile fails', async () => {
    //   const fakeUser = {
    //     name: 'Test User',
    //     email: 'test@example.com',
    //     isEmailVerified: true,
    //     toObject: () => ({
    //       name: 'Test User',
    //       email: 'test@example.com',
    //       isEmailVerified: true,
    //     }),
    //     _id: '123abc'
    //   };

    //   sinon.stub(UserService, 'createUser').resolves(fakeUser as any);
    //   sinon.stub(ProfileService, 'createProfile').rejects(new AppError('Profile creation failed', 500));

    //   try {
    //     await AuthService.register('Test User', 'test@example.com', 'password123');
    //     throw new Error('Expected method to throw.');
    //   } catch (err: any) {
    //     expect(err).to.be.instanceOf(AppError);
    //     expect(err.message).to.equal('Profile creation failed');
    //     expect(err.statusCode).to.equal(500);
    //   }
    // });
  // });

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

