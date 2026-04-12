import nodemailer from "nodemailer";

export const sendOtpEmail = async (email: string, otp: number): Promise<any> => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const isDev = process.env.DEV;
    const frontendUrl = isDev ? 'http://localhost:3000' : 'https://bellescrt.shop';

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP Code - BellesCart',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>OTP Verification - BellesCart</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0b0b0d;">
          <div style="max-width: 600px; margin: 40px auto; background: linear-gradient(135deg, #0b0b0d 0%, #16151b 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #ff4da6 0%, #ff66b3 100%); padding: 40px 30px; text-align: center;">
              <div style="font-size: 32px; font-weight: 800; color: white; letter-spacing: -1px; margin-bottom: 8px;">BellesCart</div>
              <div style="font-size: 14px; color: rgba(255,255,255,0.9); font-weight: 500;">Premium Shopping Experience</div>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              <div style="text-align: center; margin-bottom: 40px;">
                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #ff4da6 0%, #ff66b3 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" fill="white"/>
                  </svg>
                </div>
                <h1 style="color: #f5f2f8; font-size: 24px; font-weight: 700; margin: 0 0 12px 0;">Verify Your Email</h1>
                <p style="color: #a39fb3; font-size: 16px; line-height: 1.6; margin: 0;">We've sent a verification code to complete your registration</p>
              </div>
              
              <!-- OTP Display -->
              <div style="background: #1f1d22; border: 2px solid #27232d; border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 30px;">
                <p style="color: #a39fb3; font-size: 14px; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
                <div style="font-size: 36px; font-weight: 700; color: #ff4da6; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</div>
              </div>
              
              <!-- Action Button -->
              <div style="text-align: center; margin-bottom: 30px;">
                <a href="${frontendUrl}/verify-otp?email=${encodeURIComponent(email)}" style="display: inline-block; background: linear-gradient(135deg, #ff4da6 0%, #ff66b3 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; transition: transform 0.2s; box-shadow: 0 4px 15px rgba(255, 77, 166, 0.3);">
                  Verify Email Address
                </a>
              </div>
              
              <!-- Info -->
              <div style="text-align: center; margin-bottom: 30px;">
                <p style="color: #a39fb3; font-size: 14px; line-height: 1.6; margin: 0;">
                  This code will expire in <strong style="color: #ff4da6;">1 minute</strong>
                </p>
              </div>
              
              <!-- Security Notice -->
              <div style="background: rgba(255, 77, 166, 0.1); border: 1px solid rgba(255, 77, 166, 0.2); border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                <div style="display: flex; align-items: flex-start;">
                  <div style="margin-right: 12px; margin-top: 2px;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" fill="#ff4da6"/>
                    </svg>
                  </div>
                  <div>
                    <p style="color: #f5f2f8; font-size: 14px; line-height: 1.6; margin: 0; font-weight: 600;">Security Notice</p>
                    <p style="color: #a39fb3; font-size: 14px; line-height: 1.6; margin: 4px 0 0 0;">If you didn't request this verification code, please ignore this email or contact our support team.</p>
                  </div>
                </div>
              </div>
              
              <!-- Footer -->
              <div style="text-align: center; padding-top: 20px; border-top: 1px solid #27232d;">
                <p style="color: #a39fb3; font-size: 14px; line-height: 1.6; margin: 0;">
                  Best regards,<br/>
                  <span style="color: #ff4da6; font-weight: 600;">The BellesCart Team</span>
                </p>
              </div>
            </div>
            
            <!-- Bottom Bar -->
            <div style="background: #121117; padding: 20px 30px; text-align: center;">
              <p style="color: #a39fb3; font-size: 12px; margin: 0;">
                © 2024 BellesCart. All rights reserved.<br/>
                <span style="color: #666;">Belles Avenue Premium Shopping</span>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw error;
  }
};
