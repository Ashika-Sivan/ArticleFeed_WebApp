export interface IOtpRepository {
  storeOtp(email: string, otp: string): Promise<void>;
  getOtp(email: string): Promise<string | null>;
  deleteOtp(email: string): Promise<void>;
}
