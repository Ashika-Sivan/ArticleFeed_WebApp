import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CategorySelector from '../components/CategorySelector';
import {
  AlertCircle,
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Compass,
  ArrowRight,
  UserPlus,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/errorMessage';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

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

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};

    // First Name
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Please enter your first name.';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name should be at least 2 characters.';
    }

    // Last Name
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Please enter your last name.';
    }

    // Email
    const emailTrim = formData.email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailTrim) {
      newErrors.email = 'Please enter your email address.';
    } else if (!emailRegex.test(emailTrim)) {
      newErrors.email = 'Please enter a valid email address (e.g. name@example.com).';
    }

    // Phone
    const phoneClean = formData.phone.replace(/[\s-]/g, '');
    const phoneRegex = /^\d{10}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Please enter your phone number.';
    } else if (!phoneRegex.test(phoneClean)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number.';
    }

    // DOB
    if (!formData.dob) {
      newErrors.dob = 'Please select your date of birth.';
    } else {
      const selectedDate = new Date(formData.dob);
      const today = new Date();
      if (selectedDate > today) {
        newErrors.dob = 'Date of birth cannot be in the future.';
      }
    }

    // Password
    if (!formData.password) {
      newErrors.password = 'Please enter a password.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long.';
    }

    // Confirm Password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match. Please verify both entries.';
    }

    // Category Preferences
    if (!formData.preferences || formData.preferences.length === 0) {
      newErrors.preferences = 'Please select at least one interest to personalize your feed.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handlePreferencesChange = (preferences) => {
    setFormData((prev) => ({ ...prev, preferences }));
    if (errors.preferences) {
      setErrors((prev) => ({ ...prev, preferences: '' }));
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) {
      toast.error('Please complete all required fields.');
      return;
    }

    try {
      setLoading(true);
      await register({
        ...formData,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
      });
      toast.success('Account created successfully! Welcome to Chronicle.');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = getErrorMessage(err, 'Unable to create your account. Please try again.');
      setServerError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '620px', margin: '2rem auto' }}>
      <div className="card-box" style={{ padding: '2.5rem' }}>
        {/* Header */}
        <div className="auth-card-header">
          <div className="auth-header-icon">
            <UserPlus size={24} />
          </div>
          <h1 style={{ fontSize: '1.65rem', marginBottom: '0.35rem' }}>Create Your Account</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
            Join Chronicle to read tailored articles and publish your thoughts.
          </p>
        </div>

        {serverError && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleRegisterSubmit} noValidate>
          {/* Section 1: Personal Details */}
          <div className="form-section">
            <div className="form-section-title">
              <span className="form-section-icon">
                <User size={15} />
              </span>
              <span>Personal Details</span>
            </div>

            <div className="form-row-2col">
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  className={`form-input ${errors.firstName ? 'has-error' : ''}`}
                  placeholder="e.g. Alex"
                  value={formData.firstName}
                  onChange={handleChange}
                />
                {errors.firstName && (
                  <span className="field-error-msg">{errors.firstName}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  className={`form-input ${errors.lastName ? 'has-error' : ''}`}
                  placeholder="e.g. Morgan"
                  value={formData.lastName}
                  onChange={handleChange}
                />
                {errors.lastName && (
                  <span className="field-error-msg">{errors.lastName}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Date of Birth *</label>
              <input
                type="date"
                name="dob"
                className={`form-input ${errors.dob ? 'has-error' : ''}`}
                value={formData.dob}
                onChange={handleChange}
              />
              {errors.dob && (
                <span className="field-error-msg">{errors.dob}</span>
              )}
            </div>
          </div>

          {/* Section 2: Contact Details */}
          <div className="form-section">
            <div className="form-section-title">
              <span className="form-section-icon">
                <Mail size={15} />
              </span>
              <span>Contact Information</span>
            </div>

            <div className="form-row-2col">
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="text"
                  name="email"
                  className={`form-input ${errors.email ? 'has-error' : ''}`}
                  placeholder="alex@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && (
                  <span className="field-error-msg">{errors.email}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input
                  type="text"
                  name="phone"
                  className={`form-input ${errors.phone ? 'has-error' : ''}`}
                  placeholder="10-digit mobile number"
                  value={formData.phone}
                  onChange={handleChange}
                />
                {errors.phone && (
                  <span className="field-error-msg">{errors.phone}</span>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Security & Credentials */}
          <div className="form-section">
            <div className="form-section-title">
              <span className="form-section-icon">
                <Lock size={15} />
              </span>
              <span>Account Security</span>
            </div>

            <div className="form-row-2col">
              <div className="form-group">
                <label className="form-label">Password *</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    className={`form-input ${errors.password ? 'has-error' : ''}`}
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="eye-toggle-btn"
                    onClick={() => setShowPassword((prev) => !prev)}
                    title={showPassword ? 'Hide password' : 'Show password'}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <span className="field-error-msg">{errors.password}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password *</label>
                <div className="password-input-wrapper">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    className={`form-input ${errors.confirmPassword ? 'has-error' : ''}`}
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="eye-toggle-btn"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="field-error-msg">{errors.confirmPassword}</span>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Reading Preferences */}
          <div className="form-section">
            <div className="form-section-title">
              <span className="form-section-icon">
                <Compass size={15} />
              </span>
              <span>Your Interests</span>
            </div>
            <p className="form-hint" style={{ marginBottom: '0.65rem' }}>
              Select the categories you enjoy reading. We'll curate your personal feed based on your choices.
            </p>

            <div className="form-group">
              <CategorySelector
                selected={formData.preferences}
                onChange={handlePreferencesChange}
              />
              {errors.preferences && (
                <span className="field-error-msg">{errors.preferences}</span>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1.75rem', padding: '0.85rem' }}
            disabled={loading}
          >
            {loading ? (
              <span>Creating Your Account...</span>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div
          style={{
            textAlign: 'center',
            marginTop: '1.5rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-color)',
            fontSize: '0.9rem',
            color: 'var(--text-muted)',
          }}
        >
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 600 }}>
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
