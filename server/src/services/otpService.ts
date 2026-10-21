import { IOtpService, IOtpRepository, IEmailService } from '../interfaces/index.js';
import { generateOtp } from '../utils/generateOtp.js';
import { AppError } from '../middleware/errorHandler.js';
import { MESSAGES } from '../constants/index.js';

export class OtpService implements IOtpService {
  constructor(
    private readonly _otpRepository: IOtpRepository,
    private readonly _emailService: IEmailService
  ) {}

  async createOtp(email: string): Promise<string> {
    const cleanEmail = email.toLowerCase().trim();
    const otp = generateOtp();

    await this._otpRepository.storeOtp(cleanEmail, otp);
    await this._emailService.sendOtpEmail(cleanEmail, otp);

    return otp;
  }

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const cleanEmail = email.toLowerCase().trim();
    const storedOtp = await this._otpRepository.getOtp(cleanEmail);

    if (!storedOtp) {
      const error: AppError = new Error(MESSAGES.OTP.EXPIRED_OR_NOT_FOUND);
      error.statusCode = 400;
      throw error;
    }

    if (storedOtp !== otp.trim()) {
      const error: AppError = new Error(MESSAGES.OTP.INVALID);
      error.statusCode = 400;
      throw error;
    }

    await this._otpRepository.deleteOtp(cleanEmail);
    return true;
  }
}
