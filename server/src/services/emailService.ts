import nodemailer, { Transporter } from 'nodemailer';
import { IEmailService } from '../interfaces/index.js';

export class EmailService implements IEmailService {
  private _transporter: Transporter | null = null;

  constructor() {
    this._initTransporter();
  }

  private _initTransporter(): void {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (user && pass) {
      if (process.env.SMTP_HOST) {
        this._transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: { user, pass },
        });
      } else {
        // Default to Gmail service
        this._transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user, pass },
        });
      }
    }
  }

  async sendOtpEmail(email: string, otp: string): Promise<void> {
    const user = process.env.EMAIL_USER;
    const fromAddress =
      process.env.EMAIL_FROM || `"Chronicle Articles" <${user || 'no-reply@chronicle.local'}>`;

    console.log('\n=================================================');
    console.log('🔑 [OTP VERIFICATION CODE]');
    console.log(`📩 Recipient: ${email}`);
    console.log(`🔢 Code:      ${otp}`);
    console.log('⏱️ Expires in: 5 minutes (Stored in Redis)');
    console.log('=================================================\n');

    if (!this._transporter) {
      console.warn(
        '[EmailService] EMAIL_USER / EMAIL_PASS not configured in .env. OTP logged to console only.'
      );
      return;
    }

    const mailOptions = {
      from: fromAddress,
      to: email,
      subject: `Chronicle - Your Verification Code is ${otp}`,
      text: `Your verification code is: ${otp}. It will expire in 5 minutes.`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 520px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #4f46e5; margin-bottom: 6px;">Chronicle Articles</h2>
          <h3 style="color: #0f172a; margin-top: 0;">Verify Your Account</h3>
          <p style="color: #475569; font-size: 15px; line-height: 1.6;">
            Thank you for registering with Chronicle. Use the verification code below to complete your registration:
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <span style="display: inline-block; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #4f46e5; background: #eef2ff; padding: 14px 28px; border-radius: 8px; border: 1px dashed #6366f1;">
              ${otp}
            </span>
          </div>
          <p style="color: #64748b; font-size: 13px; line-height: 1.5;">
            ⏱️ <strong>This code expires in 5 minutes.</strong><br/>
            If you did not request this verification code, you can safely ignore this email.
          </p>
        </div>
      `,
    };

    try {
      const info = await this._transporter.sendMail(mailOptions);
      console.log(
        `[EmailService] OTP email sent successfully to ${email}. Message ID: ${info.messageId}`
      );
    } catch (error) {
      console.error('[EmailService] Nodemailer dispatch failed:', error);
      throw new Error(
        'Failed to deliver verification email. Please check your SMTP / App Password settings.'
      );
    }
  }
}
