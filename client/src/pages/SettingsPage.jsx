import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import CategorySelector from '../components/CategorySelector';
import { User, Lock, SlidersHorizontal, CheckCircle, AlertCircle } from 'lucide-react';

const SettingsPage = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'password', 'preferences'

  // Profile Form State
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dob: user?.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
  });

  // Synchronize form when user object updates or loads
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

  // Preferences State
  const [preferences, setPreferences] = useState(user?.preferences || []);

  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const showNotification = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  // Handle Profile Update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await userService.updateProfile(profileData);
      updateUser(res.user);
      showNotification('success', 'Profile information updated successfully.');
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Password Change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showNotification('error', 'New passwords do not match.');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      showNotification('error', 'New password must be at least 6 characters long.');
      return;
    }
    try {
      setLoading(true);
      await userService.changePassword(passwordData);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showNotification('success', 'Password updated successfully.');
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Preferences Save
  const handlePreferencesSubmit = async (e) => {
    e.preventDefault();
    if (preferences.length === 0) {
      showNotification('error', 'Please select at least one preference.');
      return;
    }
    try {
      setLoading(true);
      const res = await userService.updatePreferences(preferences);
      updateUser(res.user);
      showNotification('success', 'Category preferences saved successfully.');
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Failed to update preferences.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '1.5rem auto' }}>
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
        }}
      >
        <button
          onClick={() => setActiveTab('profile')}
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
          onClick={() => setActiveTab('password')}
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
          onClick={() => setActiveTab('preferences')}
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
      </div>

      {message.text && (
        <div className={`alert ${message.type === 'error' ? 'alert-error' : 'alert-success'}`}>
          {message.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="card-box" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Personal Information</h3>
          <form onSubmit={handleProfileSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-input"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input
                type="date"
                className="form-input"
                value={profileData.dob}
                onChange={(e) => setProfileData({ ...profileData, dob: e.target.value })}
                required
              />
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
          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter current password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="At least 6 characters"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Repeat new password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                required
              />
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
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>Article Feed Preferences</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            Select topics you want to prioritize on your dashboard.
          </p>

          <form onSubmit={handlePreferencesSubmit}>
            <CategorySelector selected={preferences} onChange={setPreferences} />

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '1.5rem' }}>
              {loading ? 'Saving Preferences...' : 'Save Preferences'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
