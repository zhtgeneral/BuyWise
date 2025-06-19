import sinon from 'sinon';
import { expect } from 'chai';
import jwt from 'jsonwebtoken';
process.env.JWT_SECRET = "test-secret";
import { AuthService } from '../services/authService';
import Profile from '../models/Profile';
import { AppError } from '../utils/AppError';

describe('authService', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should return token and profile when login succeeds', async () => {
    const fakeProfile = {
      email: 'test@example.com',
      isEmailVerified: true,
      password: 'hashed-password',
      comparePassword: sinon.stub().resolves(true),
      toObject: () => ({
        email: 'test@example.com',
        isEmailVerified: true,
      }),
      _id: '123abc'
    };

    sinon.stub().resolves(fakeProfile);

    sinon.stub(Profile, 'findOne').returns({
      select: () => Promise.resolve(fakeProfile)
    } as any);

    const result = await AuthService.login('test@example.com', 'valid-password');

    expect(result).to.have.property('token').that.is.a('string');
    expect(result.profile).to.include({
      email: 'test@example.com',
      isEmailVerified: true,
    });

    const payload = jwt.verify(result.token, process.env.JWT_SECRET || 'your-secret-key') as any;
    expect(payload).to.have.property('id', '123abc');
  });

  it('should throw an error when profile is not found', async () => {
    sinon.stub(Profile, 'findOne').returns({
      select: () => Promise.resolve(null)
    } as any);
  
    try {
      await AuthService.login('notfound@example.com', 'any-password');
      throw new Error('Expected method to throw.');
    } catch (err) {
      expect(err).to.have.property('message', 'Invalid email or password');
      expect(err).to.have.property('statusCode', 401);
    }
  });
  
  it('should throw an error when email is not verified', async () => {
    const fakeProfile = {
      email: 'test@example.com',
      isEmailVerified: false,
      password: 'hashed-password',
      comparePassword: sinon.stub().resolves(true),
      toObject: () => ({
        email: 'test@example.com',
        isEmailVerified: false,
      }),
      _id: '123abc'
    };

    const selectStub = sinon.stub().resolves(fakeProfile);
    sinon.stub(Profile, 'findOne').returns({ select: selectStub } as any);

    try {
      await AuthService.login('test@example.com', 'valid-password');
      throw new Error('Expected method to throw.');
    } catch (err: any) {
      expect(err).to.be.instanceOf(AppError);
      expect(err.message).to.equal('Please verify your email before logging in');
      expect(err.statusCode).to.equal(401);
    }
  });

  it('should throw an error when password is invalid', async () => {
    const fakeProfile = {
      email: 'test@example.com',
      isEmailVerified: true,
      password: 'hashed-password',
      comparePassword: sinon.stub().resolves(false),
      toObject: () => ({
        email: 'test@example.com',
        isEmailVerified: true,
      }),
      _id: '123abc'
    };

    const selectStub = sinon.stub().resolves(fakeProfile);
    sinon.stub(Profile, 'findOne').returns({ select: selectStub } as any);

    try {
      await AuthService.login('test@example.com', 'wrong-password');
      throw new Error('Expected method to throw.');
    } catch (err: any) {
      expect(err).to.be.instanceOf(AppError);
      expect(err.message).to.equal('Invalid email or password');
      expect(err.statusCode).to.equal(401);
    }
  });

  it('should throw an error if password field is missing', async () => {
    const fakeProfile = {
      email: 'test@example.com',
      isEmailVerified: true,
      comparePassword: sinon.stub().resolves(false),
      toObject: () => ({
        email: 'test@example.com',
        isEmailVerified: true,
      }),
      _id: '123abc'
    };

    const selectStub = sinon.stub().resolves(fakeProfile);
    sinon.stub(Profile, 'findOne').returns({ select: selectStub } as any);

    try {
      await AuthService.login('test@example.com', 'any-password');
      throw new Error('Expected method to throw.');
    } catch (err: any) {
      expect(err).to.be.instanceOf(AppError);
      expect(err.message).to.equal('Invalid email or password');
      expect(err.statusCode).to.equal(401);
    }
  });
});
