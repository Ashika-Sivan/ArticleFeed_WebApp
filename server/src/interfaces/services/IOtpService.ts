export interface IOtpService {
  createOtp(email: string): Promise<string>;
  verifyOtp(email: string, otp: string): Promise<boolean>;
}
