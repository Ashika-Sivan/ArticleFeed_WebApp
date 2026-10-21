import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CategorySelector from '../components/CategorySelector';
import { AlertCircle, CheckCircle, Mail, ArrowLeft, RefreshCw, Clock } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, verifyOtp, resendOtp } = useAuth();

  // Step 1: 'form', Step 2: 'otp'
  const [step, setStep] = useState('form');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    dob: '',
    password: '',
    confirmPassword: '',
    preferences: [],
  });

  // OTP state
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 minutes
  const [resendLoading, setResendLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const otpInputsRef = useRef([]);

  // Countdown timer for OTP expiry & resend cooldown
  useEffect(() => {
    let interval = null;
    if (step === 'otp') {
      interval = setInterval(() => {
        setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePreferencesChange = (preferences) => {
    setFormData((prev) => ({ ...prev, preferences }));
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.phone ||
      !formData.email ||
      !formData.dob ||
      !formData.password
    ) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.preferences.length === 0) {
      setError('Please select at least one article category preference.');
      return;
    }

    try {
      setLoading(true);
      const res = await register(formData);
      if (res.requiresOtp) {
        setStep('otp');
        setTimerSeconds(300);
        setResendCooldown(60);
        const msg = res?.devOtp
          ? `Verification code: ${res.devOtp} (Sent to email & logged to console)`
          : 'A 6-digit verification code was sent to your email.';
        setSuccessMessage(msg);
        // Focus first OTP input on step change
        setTimeout(() => {
          if (otpInputsRef.current[0]) {
            otpInputsRef.current[0].focus();
          }
        }, 100);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to register account. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle individual digit input
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    // Take only the last entered digit
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5 && otpInputsRef.current[index + 1]) {
      otpInputsRef.current[index + 1].focus();
    }
  };

  // Handle backspace navigation
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && otpInputsRef.current[index - 1]) {
      otpInputsRef.current[index - 1].focus();
    }
  };

  // Handle paste full 6-digit OTP
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasteData)) {
      const digits = pasteData.split('');
      setOtp(digits);
      if (otpInputsRef.current[5]) {
        otpInputsRef.current[5].focus();
      }
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    try {
      setLoading(true);
      await verifyOtp({
        email: formData.email,
        otp: otpCode,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Invalid or expired OTP code. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resendLoading) return;
    setError('');
    setSuccessMessage('');

    try {
      setResendLoading(true);
      const res = await resendOtp({ email: formData.email });
      const msg = res?.devOtp
        ? `New verification code: ${res.devOtp} (Sent to email & logged)`
        : 'A fresh verification code has been sent to your email.';
      setSuccessMessage(msg);
      setResendCooldown(60);
      setTimerSeconds(300);
      setOtp(['', '', '', '', '', '']);
      if (otpInputsRef.current[0]) {
        otpInputsRef.current[0].focus();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ maxWidth: step === 'otp' ? '460px' : '580px', margin: '2rem auto' }}>
      <div className="card-box" style={{ padding: '2.25rem' }}>
        {step === 'form' ? (
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Create Account</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Enter your details to create an account and personalize your feeds.
              </p>
            </div>

            {error && (
              <div className="alert alert-error">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit}>
              {/* Name Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    className="form-input"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    className="form-input"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-input"
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div className="form-group">
                <label className="form-label">Date of Birth *</label>
                <input
                  type="date"
                  name="dob"
                  className="form-input"
                  value={formData.dob}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Password & Confirm */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input
                    type="password"
                    name="password"
                    className="form-input"
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    className="form-input"
                    placeholder="Repeat password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Reusable Category Selector */}
              <div className="form-group" style={{ marginTop: '0.5rem' }}>
                <label className="form-label">
                  Article Preferences (Select at least one) *
                </label>
                <CategorySelector
                  selected={formData.preferences}
                  onChange={handlePreferencesChange}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '1.25rem', padding: '0.75rem' }}
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>

            <div
              style={{
                textAlign: 'center',
                marginTop: '1.25rem',
                fontSize: '0.9rem',
                color: 'var(--text-muted)',
              }}
            >
              Already have an account?{' '}
              <Link to="/login" style={{ fontWeight: 600 }}>
                Log In
              </Link>
            </div>
          </>
        ) : (
          /* Step 2: OTP Verification */
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  margin: '0 auto 1rem',
                  borderRadius: '50%',
                  background: 'rgba(79, 70, 229, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)',
                }}
              >
                <Mail size={28} />
              </div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Verify Your Email</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                We sent a 6-digit verification code to
              </p>
              <p style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                {formData.email}
              </p>
            </div>

            {successMessage && (
              <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
                <CheckCircle size={18} />
                <span>{successMessage}</span>
              </div>
            )}

            {error && (
              <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtp}>
              {/* 6 Digit Inputs */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  margin: '1.75rem 0 1.25rem',
                }}
                onPaste={handleOtpPaste}
              >
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputsRef.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    style={{
                      width: '48px',
                      height: '56px',
                      fontSize: '1.4rem',
                      fontWeight: 700,
                      textAlign: 'center',
                      borderRadius: '8px',
                      border: digit
                        ? '2px solid var(--primary)'
                        : '1px solid var(--border-color)',
                      outline: 'none',
                      backgroundColor: 'var(--bg-card)',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                    }}
                    autoFocus={idx === 0}
                  />
                ))}
              </div>

              {/* Expiry Timer Display */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  color: timerSeconds > 0 ? 'var(--text-muted)' : 'var(--danger)',
                  fontSize: '0.875rem',
                  marginBottom: '1.5rem',
                }}
              >
                <Clock size={16} />
                {timerSeconds > 0 ? (
                  <span>Code expires in: <strong>{formatTime(timerSeconds)}</strong></span>
                ) : (
                  <span>Code expired. Please request a new one.</span>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem' }}
                disabled={loading || otp.join('').length !== 6 || timerSeconds === 0}
              >
                {loading ? 'Verifying...' : 'Verify & Complete Registration'}
              </button>
            </form>

            {/* Resend & Back controls */}
            <div
              style={{
                marginTop: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                alignItems: 'center',
                fontSize: '0.9rem',
              }}
            >
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || resendLoading}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                  color: resendCooldown > 0 ? 'var(--text-muted)' : 'var(--primary)',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <RefreshCw size={15} className={resendLoading ? 'spin' : ''} />
                {resendCooldown > 0
                  ? `Resend code in ${resendCooldown}s`
                  : 'Resend Verification Code'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('form');
                  setError('');
                  setSuccessMessage('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                <ArrowLeft size={14} />
                Edit registration details
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
