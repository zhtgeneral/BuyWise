import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { CreateEmailOptions, Resend } from 'resend';



dotenv.config();

export const sendVerificationEmail = async (email: string, token: string) => {
  const resend = new Resend(process.env.RESEND_API_KEY || '');
  // Create a transporter using Gmail
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD // Use App Password, not your regular Gmail password
    }
  });
  
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  
  const mailOptions:CreateEmailOptions = {
    from: process.env.EMAIL_USER || '',
    to: [email],
    subject: 'Verify your BuyWise account',
    html: `
      <h1>Welcome to BuyWise!</h1>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't create an account with BuyWise, please ignore this email.</p>
    `
  };

  try {
    console.log(mailOptions);
    
    await resend.emails.send(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
}; 