import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, CheckCircle, Mail, ArrowLeft, RefreshCw, Clock } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, verifyOtp, resendOtp } = useAuth();

  const [step, setStep] = useState('login'); // 'login' | 'otp'
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });

  // OTP state for unverified accounts
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timerSeconds, setTimerSeconds] = useState(300);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [resendLoading, setResendLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const otpInputsRef = useRef([]);

  // Timer for OTP in login
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!formData.identifier.trim() || !formData.password) {
      setError('Please provide your email/phone and password.');
      return;
    }

    try {
      setLoading(true);
      await login({
        identifier: formData.identifier.trim(),
        password: formData.password,
      });
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to sign in.';
      if (err.response?.status === 403 && msg.toLowerCase().includes('verify')) {
        // Account unverified - switch to OTP verification step
        setUnverifiedEmail(formData.identifier.trim());
        setStep('otp');
        setTimerSeconds(300);
        setResendCooldown(60);
        setSuccessMessage(msg);
        setTimeout(() => {
          if (otpInputsRef.current[0]) otpInputsRef.current[0].focus();
        }, 100);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5 && otpInputsRef.current[index + 1]) {
      otpInputsRef.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && otpInputsRef.current[index - 1]) {
      otpInputsRef.current[index - 1].focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasteData)) {
      setOtp(pasteData.split(''));
      if (otpInputsRef.current[5]) otpInputsRef.current[5].focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits.');
      return;
    }

    try {
      setLoading(true);
      await verifyOtp({
        email: unverifiedEmail,
        otp: otpCode,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP code.');
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
      const res = await resendOtp({ email: unverifiedEmail });
      const msg = res?.devOtp
        ? `New verification code: ${res.devOtp} (Sent to email & logged)`
        : 'A fresh verification code has been sent to your email.';
      setSuccessMessage(msg);
      setResendCooldown(60);
      setTimerSeconds(300);
      setOtp(['', '', '', '', '', '']);
      if (otpInputsRef.current[0]) otpInputsRef.current[0].focus();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code.');
    } finally {
      setResendLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ maxWidth: '440px', margin: '3rem auto' }}>
      <div className="card-box" style={{ padding: '2rem' }}>
        {step === 'login' ? (
          <>
            <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>Welcome Back</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Log in with your registered email or phone number
              </p>
            </div>

            {error && (
              <div className="alert alert-error">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email or Phone Number</label>
                <input
                  type="text"
                  name="identifier"
                  className="form-input"
                  placeholder="name@example.com or 9876543210"
                  value={formData.identifier}
                  onChange={handleChange}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '1rem', padding: '0.75rem' }}
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Log In'}
              </button>
            </form>

            <div
              style={{
                textAlign: 'center',
                marginTop: '1.5rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--border-color)',
                fontSize: '0.9rem',
                color: 'var(--text-muted)',
              }}
            >
              Don't have an account?{' '}
              <Link to="/register" style={{ fontWeight: 600 }}>
                Sign up here
              </Link>
            </div>
          </>
        ) : (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  margin: '0 auto 1rem',
                  borderRadius: '50%',
                  background: 'rgba(79, 70, 229, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)',
                }}
              >
                <Mail size={26} />
              </div>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '0.4rem' }}>Verify Account</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Please enter the 6-digit code sent to
              </p>
              <p style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                {unverifiedEmail}
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
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  margin: '1.5rem 0 1rem',
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
                      width: '44px',
                      height: '52px',
                      fontSize: '1.3rem',
                      fontWeight: 700,
                      textAlign: 'center',
                      borderRadius: '8px',
                      border: digit
                        ? '2px solid var(--primary)'
                        : '1px solid var(--border-color)',
                      outline: 'none',
                      backgroundColor: 'var(--bg-card)',
                    }}
                    autoFocus={idx === 0}
                  />
                ))}
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  color: timerSeconds > 0 ? 'var(--text-muted)' : 'var(--danger)',
                  fontSize: '0.85rem',
                  marginBottom: '1.25rem',
                }}
              >
                <Clock size={15} />
                {timerSeconds > 0 ? (
                  <span>Code expires in: <strong>{formatTime(timerSeconds)}</strong></span>
                ) : (
                  <span>Code expired. Request a new code.</span>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem' }}
                disabled={loading || otp.join('').length !== 6 || timerSeconds === 0}
              >
                {loading ? 'Verifying...' : 'Verify & Log In'}
              </button>
            </form>

            <div
              style={{
                marginTop: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                alignItems: 'center',
                fontSize: '0.875rem',
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
                <RefreshCw size={14} className={resendLoading ? 'spin' : ''} />
                {resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : 'Resend Verification Code'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('login');
                  setError('');
                  setSuccessMessage('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                <ArrowLeft size={14} />
                Back to Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
