import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import articleService from '../services/articleService';
import CategorySelector from '../components/CategorySelector';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import {
  User,
  Lock,
  SlidersHorizontal,
  ShieldOff,
  Eye,
  EyeOff,
  CheckCircle,
  RotateCcw,
  Search,
  X,
  Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { toastConfirm } from '../utils/toastConfirm';
import { getErrorMessage } from '../utils/errorMessage';

const SettingsPage = () => {
  const { user, updateUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState(initialTab);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Profile Form State
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dob: user?.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
  });

  const [profileErrors, setProfileErrors] = useState({});
  const [profileConfirmationMsg, setProfileConfirmationMsg] = useState('');

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
      });
      setPreferences(user.preferences || []);
    }
  }, [user]);

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [passwordErrors, setPasswordErrors] = useState({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Preferences State
  const [preferences, setPreferences] = useState(user?.preferences || []);
  const [prefError, setPrefError] = useState('');

  const [loading, setLoading] = useState(false);

  // Blocked Articles State
  const [blockedArticles, setBlockedArticles] = useState([]);
  const [blockedLoading, setBlockedLoading] = useState(false);
  const [blockedPage, setBlockedPage] = useState(1);
  const [blockedSearch, setBlockedSearch] = useState('');
  const [debouncedBlockedSearch, setDebouncedBlockedSearch] = useState('');
  const [blockedPagination, setBlockedPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Debounce blocked articles search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedBlockedSearch(blockedSearch.trim());
      setBlockedPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [blockedSearch]);

  const loadBlockedArticles = useCallback(async () => {
    try {
      setBlockedLoading(true);
      const params = {
        page: blockedPage,
        limit: 5,
      };
      if (debouncedBlockedSearch) params.search = debouncedBlockedSearch;

      const res = await articleService.getBlockedArticles(params);
      setBlockedArticles(res.articles || []);
      if (res.pagination) {
        setBlockedPagination(res.pagination);
      }
    } catch (err) {
      console.error('Failed to load blocked articles:', err);
    } finally {
      setBlockedLoading(false);
    }
  }, [blockedPage, debouncedBlockedSearch]);

  useEffect(() => {
    if (activeTab === 'blocked') {
      loadBlockedArticles();
    }
  }, [activeTab, loadBlockedArticles]);

  const handleUnblock = (articleId, title) => {
    toastConfirm({
      message: `Unblock "${title}"? It will appear in your feed again.`,
      confirmText: 'Unblock',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          await articleService.unblockArticle(articleId);
          toast.success('Article unblocked successfully.');
          loadBlockedArticles();
        } catch (err) {
          const msg = getErrorMessage(err, 'Failed to unblock article.');
          toast.error(msg);
        }
      },
    });
  };

  // Validate Profile
  const validateProfile = () => {
    const errs = {};
    if (!profileData.firstName.trim()) {
      errs.firstName = 'Please enter your first name.';
    }
    if (!profileData.lastName.trim()) {
      errs.lastName = 'Please enter your last name.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!profileData.email.trim()) {
      errs.email = 'Please enter your email address.';
    } else if (!emailRegex.test(profileData.email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }
    const phoneClean = profileData.phone.replace(/[\s-]/g, '');
    const phoneRegex = /^\d{10}$/;
    if (!profileData.phone.trim()) {
      errs.phone = 'Please enter your phone number.';
    } else if (!phoneRegex.test(phoneClean)) {
      errs.phone = 'Please enter a valid 10-digit phone number.';
    }
    if (!profileData.dob) {
      errs.dob = 'Please provide your date of birth.';
    }
    setProfileErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Handle Profile Update
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setProfileConfirmationMsg('');

    if (!validateProfile()) {
      toast.error('Please check the highlighted profile fields.');
      return;
    }

    toastConfirm({
      message: 'Save changes to your profile?',
      confirmText: 'Save Changes',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          setLoading(true);
          const res = await userService.updateProfile({
            ...profileData,
            firstName: profileData.firstName.trim(),
            lastName: profileData.lastName.trim(),
            email: profileData.email.trim().toLowerCase(),
            phone: profileData.phone.trim(),
          });
          updateUser(res.user);
          const successMsg = 'Your profile details have been saved successfully.';
          setProfileConfirmationMsg(successMsg);
          toast.success(successMsg);
        } catch (err) {
          const msg = getErrorMessage(err, 'Unable to update profile. Please try again.');
          toast.error(msg);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // Validate Password
  const validatePassword = () => {
    const errs = {};
    if (!passwordData.currentPassword) {
      errs.currentPassword = 'Please enter your current password.';
    }
    if (!passwordData.newPassword) {
      errs.newPassword = 'Please enter a new password.';
    } else if (passwordData.newPassword.length < 6) {
      errs.newPassword = 'New password must be at least 6 characters long.';
    }
    if (!passwordData.confirmPassword) {
      errs.confirmPassword = 'Please re-enter your new password.';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errs.confirmPassword = 'New passwords do not match. Please verify both entries.';
    }
    setPasswordErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Handle Password Change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validatePassword()) {
      toast.error('Please check the password fields above.');
      return;
    }
    try {
      setLoading(true);
      await userService.changePassword(passwordData);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Your password has been updated successfully.');
    } catch (err) {
      const msg = getErrorMessage(err, 'Unable to change password. Please verify your current password.');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Handle Preferences Save
  const handlePreferencesSubmit = async (e) => {
    e.preventDefault();
    if (!preferences || preferences.length === 0) {
      const errText = 'Please select at least one interest to customize your feed.';
      setPrefError(errText);
      toast.error(errText);
      return;
    }
    setPrefError('');
    try {
      setLoading(true);
      const res = await userService.updatePreferences(preferences);
      updateUser(res.user);
      toast.success('Your feed preferences have been saved successfully.');
    } catch (err) {
      const msg = getErrorMessage(err, 'Unable to save preferences. Please try again.');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: activeTab === 'blocked' ? '840px' : '640px', margin: '1.5rem auto', transition: 'max-width 0.2s ease' }}>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Account Settings</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        Manage your profile, security, and article feed preferences
      </p>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() => handleTabChange('profile')}
          className="btn btn-sm"
          style={{
            background: activeTab === 'profile' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'profile' ? '#ffffff' : 'var(--text-muted)',
            borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
          }}
        >
          <User size={15} />
          <span>Profile</span>
        </button>

        <button
          onClick={() => handleTabChange('password')}
          className="btn btn-sm"
          style={{
            background: activeTab === 'password' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'password' ? '#ffffff' : 'var(--text-muted)',
            borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
          }}
        >
          <Lock size={15} />
          <span>Password</span>
        </button>

        <button
          onClick={() => handleTabChange('preferences')}
          className="btn btn-sm"
          style={{
            background: activeTab === 'preferences' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'preferences' ? '#ffffff' : 'var(--text-muted)',
            borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
          }}
        >
          <SlidersHorizontal size={15} />
          <span>Feed Preferences</span>
        </button>

        <button
          onClick={() => handleTabChange('blocked')}
          className="btn btn-sm"
          style={{
            background: activeTab === 'blocked' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'blocked' ? '#ffffff' : 'var(--text-muted)',
            borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
          }}
        >
          <ShieldOff size={15} />
          <span>Blocked Articles</span>
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="card-box" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Personal Information</h3>

          {profileConfirmationMsg && (
            <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>
              <CheckCircle size={18} />
              <span>{profileConfirmationMsg}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} noValidate>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  className={`form-input ${profileErrors.firstName ? 'has-error' : ''}`}
                  value={profileData.firstName}
                  onChange={(e) => {
                    setProfileData({ ...profileData, firstName: e.target.value });
                    if (profileErrors.firstName) setProfileErrors({ ...profileErrors, firstName: '' });
                  }}
                />
                {profileErrors.firstName && (
                  <span className="field-error-msg">{profileErrors.firstName}</span>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  className={`form-input ${profileErrors.lastName ? 'has-error' : ''}`}
                  value={profileData.lastName}
                  onChange={(e) => {
                    setProfileData({ ...profileData, lastName: e.target.value });
                    if (profileErrors.lastName) setProfileErrors({ ...profileErrors, lastName: '' });
                  }}
                />
                {profileErrors.lastName && (
                  <span className="field-error-msg">{profileErrors.lastName}</span>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="text"
                  className={`form-input ${profileErrors.email ? 'has-error' : ''}`}
                  value={profileData.email}
                  onChange={(e) => {
                    setProfileData({ ...profileData, email: e.target.value });
                    if (profileErrors.email) setProfileErrors({ ...profileErrors, email: '' });
                  }}
                />
                {profileErrors.email && (
                  <span className="field-error-msg">{profileErrors.email}</span>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className={`form-input ${profileErrors.phone ? 'has-error' : ''}`}
                  value={profileData.phone}
                  onChange={(e) => {
                    setProfileData({ ...profileData, phone: e.target.value });
                    if (profileErrors.phone) setProfileErrors({ ...profileErrors, phone: '' });
                  }}
                />
                {profileErrors.phone && (
                  <span className="field-error-msg">{profileErrors.phone}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input
                type="date"
                className={`form-input ${profileErrors.dob ? 'has-error' : ''}`}
                value={profileData.dob}
                onChange={(e) => {
                  setProfileData({ ...profileData, dob: e.target.value });
                  if (profileErrors.dob) setProfileErrors({ ...profileErrors, dob: '' });
                }}
              />
              {profileErrors.dob && (
                <span className="field-error-msg">{profileErrors.dob}</span>
              )}
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '0.5rem' }}>
              {loading ? 'Saving...' : 'Update Profile'}
            </button>
          </form>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <div className="card-box" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Change Password</h3>
          <form onSubmit={handlePasswordSubmit} noValidate>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  className={`form-input ${passwordErrors.currentPassword ? 'has-error' : ''}`}
                  placeholder="Enter current password"
                  value={passwordData.currentPassword}
                  onChange={(e) => {
                    setPasswordData({ ...passwordData, currentPassword: e.target.value });
                    if (passwordErrors.currentPassword) setPasswordErrors({ ...passwordErrors, currentPassword: '' });
                  }}
                />
                <button
                  type="button"
                  className="eye-toggle-btn"
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  title={showCurrentPassword ? 'Hide password' : 'Show password'}
                  aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                >
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passwordErrors.currentPassword && (
                <span className="field-error-msg">{passwordErrors.currentPassword}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  className={`form-input ${passwordErrors.newPassword ? 'has-error' : ''}`}
                  placeholder="At least 6 characters"
                  value={passwordData.newPassword}
                  onChange={(e) => {
                    setPasswordData({ ...passwordData, newPassword: e.target.value });
                    if (passwordErrors.newPassword) setPasswordErrors({ ...passwordErrors, newPassword: '' });
                  }}
                />
                <button
                  type="button"
                  className="eye-toggle-btn"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  title={showNewPassword ? 'Hide password' : 'Show password'}
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passwordErrors.newPassword && (
                <span className="field-error-msg">{passwordErrors.newPassword}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`form-input ${passwordErrors.confirmPassword ? 'has-error' : ''}`}
                  placeholder="Repeat new password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => {
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value });
                    if (passwordErrors.confirmPassword) setPasswordErrors({ ...passwordErrors, confirmPassword: '' });
                  }}
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
              {passwordErrors.confirmPassword && (
                <span className="field-error-msg">{passwordErrors.confirmPassword}</span>
              )}
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '0.5rem' }}>
              {loading ? 'Updating Password...' : 'Change Password'}
            </button>
          </form>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="card-box" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Personalize Your Feed</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Choose the categories you are interested in.
          </p>
          <form onSubmit={handlePreferencesSubmit} noValidate>
            <div className="form-group">
              <CategorySelector
                selected={preferences}
                onChange={(newPrefs) => {
                  setPreferences(newPrefs);
                  if (prefError) setPrefError('');
                }}
              />
              {prefError && <span className="field-error-msg">{prefError}</span>}
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '1.25rem' }}>
              {loading ? 'Saving...' : 'Save Preferences'}
            </button>
          </form>
        </div>
      )}

      {/* Blocked Articles Tab */}
      {activeTab === 'blocked' && (
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>Blocked Articles</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Articles you blocked are hidden from your feed. You can review or unblock them anytime.
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-dim)',
              }}
            />
            <input
              type="text"
              placeholder="Search blocked articles by title, description, or category..."
              value={blockedSearch}
              onChange={(e) => setBlockedSearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.5rem', paddingRight: blockedSearch ? '2.5rem' : '0.85rem' }}
            />
            {blockedSearch && (
              <button
                type="button"
                onClick={() => setBlockedSearch('')}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                  padding: '0.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Clear search"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {blockedLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
              Loading blocked articles...
            </div>
          ) : blockedArticles.length === 0 ? (
            <EmptyState
              title={debouncedBlockedSearch ? 'No Matching Blocked Articles' : 'No Blocked Articles'}
              description={
                debouncedBlockedSearch
                  ? `No blocked articles found matching "${debouncedBlockedSearch}".`
                  : "You haven't blocked any articles yet. When you block an article from your feed, it will show up here."
              }
            >
              {debouncedBlockedSearch && (
                <button
                  type="button"
                  onClick={() => setBlockedSearch('')}
                  className="btn btn-secondary btn-sm"
                >
                  Clear Search
                </button>
              )}
            </EmptyState>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {blockedArticles.map((article) => (
                  <div
                    key={article._id}
                    className="card-box"
                    style={{
                      padding: '1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1rem',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flex: '1 1 300px' }}>
                      {article.images && article.images[0] && (
                        <img
                          src={article.images[0]}
                          alt={article.title}
                          style={{
                            width: '72px',
                            height: '72px',
                            borderRadius: 'var(--radius-sm)',
                            objectFit: 'cover',
                            flexShrink: 0,
                            border: '1px solid var(--border-color)',
                          }}
                        />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                          <span
                            style={{
                              background: '#fee2e2',
                              color: 'var(--danger)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              padding: '0.12rem 0.45rem',
                              borderRadius: 'var(--radius-sm)',
                            }}
                          >
                            Blocked
                          </span>
                          <span
                            style={{
                              background: '#eef2ff',
                              color: 'var(--primary)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              padding: '0.12rem 0.45rem',
                              borderRadius: 'var(--radius-sm)',
                            }}
                          >
                            {article.category}
                          </span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Calendar size={12} />
                            {new Date(article.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <h4 style={{ fontSize: '1.05rem', marginBottom: '0.25rem' }}>
                          {article.title}
                        </h4>

                        <p
                          style={{
                            color: 'var(--text-muted)',
                            fontSize: '0.85rem',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            margin: 0,
                          }}
                        >
                          {article.description}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleUnblock(article._id, article.title)}
                      className="btn btn-secondary btn-sm"
                      title="Unblock and restore to feed"
                    >
                      <RotateCcw size={14} />
                      <span>Unblock</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <Pagination
                pagination={blockedPagination}
                onPageChange={(newPage) => {
                  setBlockedPage(newPage);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
