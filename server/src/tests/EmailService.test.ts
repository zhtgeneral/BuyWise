import sinon from 'sinon';
import { expect } from 'chai';
import nodemailer from 'nodemailer';
import * as emailService from '../services/EmailService';

describe('EmailService', () => {
  let sendMailStub: sinon.SinonStub;
  let createTransportStub: sinon.SinonStub;

  beforeEach(() => {
    sendMailStub = sinon.stub().resolves();

    createTransportStub = sinon.stub(nodemailer, 'createTransport').returns({
      sendMail: sendMailStub
    } as any);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should send email with correct options', async () => {
    const email = 'test@example.com';
    const token = 'dummy-token';

    process.env.FRONTEND_URL = 'http://localhost:3000';
    process.env.EMAIL_USER = 'testuser@gmail.com';

    await emailService.sendVerificationEmail(email, token);

    expect(sendMailStub.calledOnce).to.be.true;

    const mailOptions = sendMailStub.firstCall.args[0];
    expect(mailOptions.to).to.equal(email);
    expect(mailOptions.from).to.equal(process.env.EMAIL_USER);
    expect(mailOptions.subject).to.include('Verify your BuyWise account');
    expect(mailOptions.html).to.include(`${process.env.FRONTEND_URL}/verify-email?token=${token}`);
  });

  it('should throw an error when sending email fails', async () => {
    sendMailStub.rejects(new Error('SMTP error'));

    try {
      await emailService.sendVerificationEmail('fail@example.com', 'token');
      throw new Error('Expected method to throw.');
    } catch (err: any) {
      expect(err.message).to.equal('Failed to send verification email');
    }
  });
});
