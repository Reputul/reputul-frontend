import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { token } = useAuth();
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [accountStats, setAccountStats] = useState({
    businessCount: 0,
    totalReviews: 0,
    averageRating: 0,
    joinDate: new Date()
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
        setNewName(res.data.name);
        
        // Fetch account statistics
        const dashboardRes = await axios.get('http://localhost:8080/api/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const businesses = dashboardRes.data;
        const totalReviews = businesses.reduce((sum, biz) => sum + (biz.reviewCount || 0), 0);
        const avgRating = businesses.length > 0 
          ? businesses.reduce((sum, biz) => sum + (biz.reputationScore || 0), 0) / businesses.length 
          : 0;
        
        setAccountStats({
          businessCount: businesses.length,
          totalReviews,
          averageRating: avgRating.toFixed(1),
          joinDate: new Date() // Would come from user creation date in real app
        });
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  // Calculate password strength
  useEffect(() => {
    const calculateStrength = (password) => {
      let strength = 0;
      if (password.length >= 8) strength += 1;
      if (/[a-z]/.test(password)) strength += 1;
      if (/[A-Z]/.test(password)) strength += 1;
      if (/\d/.test(password)) strength += 1;
      if (/[^a-zA-Z\d]/.test(password)) strength += 1;
      return strength;
    };
    
    setPasswordStrength(calculateStrength(newPassword));
  }, [newPassword]);

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength <= 2) return 'bg-yellow-500';
    if (passwordStrength <= 3) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength <= 2) return 'Fair';
    if (passwordStrength <= 3) return 'Good';
    return 'Strong';
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (newPassword && newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setUpdating(true);
    setError('');
    setSuccess('');
    
    try {
      const updateData = { name: newName };
      if (newPassword) {
        updateData.password = newPassword;
      }

      await axios.put(
        'http://localhost:8080/api/users/profile',
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      setProfile({ ...profile, name: newName });
      setNewPassword('');
      setConfirmPassword('');
      setSuccess('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleExportData = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/users/export', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reputul-data-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting data:', err);
      alert('Failed to export data');
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    const confirmText = prompt('Type "DELETE" to confirm account deletion:');
    if (confirmText !== 'DELETE') {
      alert('Account deletion cancelled');
      return;
    }

    try {
      await axios.delete('http://localhost:8080/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      alert('Account deleted successfully');
      // Redirect to login or logout
      window.location.href = '/login';
    } catch (err) {
      console.error('Error deleting account:', err);
      alert('Failed to delete account');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-20 h-20 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl font-bold">
                {profile.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Account Stats Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Current Profile Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Account Overview</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <span className="text-blue-600">👤</span>
                  <div>
                    <div className="font-semibold text-gray-900">{profile.name}</div>
                    <div className="text-sm text-gray-600">Account Name</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-blue-600">📧</span>
                  <div>
                    <div className="font-semibold text-gray-900">{profile.email}</div>
                    <div className="text-sm text-gray-600">Email Address</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-blue-600">📅</span>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {accountStats.joinDate.toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-600">Member Since</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Statistics */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Your Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-blue-600">🏢</span>
                    <span className="font-medium text-gray-900">Businesses</span>
                  </div>
                  <span className="text-xl font-bold text-blue-600">
                    {accountStats.businessCount}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-green-600">💬</span>
                    <span className="font-medium text-gray-900">Total Reviews</span>
                  </div>
                  <span className="text-xl font-bold text-green-600">
                    {accountStats.totalReviews}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-yellow-600">⭐</span>
                    <span className="font-medium text-gray-900">Avg Rating</span>
                  </div>
                  <span className="text-xl font-bold text-yellow-600">
                    {accountStats.averageRating}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <span className="text-green-600">💡</span>
                </div>
                <h3 className="text-lg font-bold text-green-900">Profile Tips</h3>
              </div>
              <ul className="text-sm text-green-800 space-y-2">
                <li className="flex items-start space-x-2">
                  <span>•</span>
                  <span>Keep your profile information up to date</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span>•</span>
                  <span>Use a strong password with numbers and symbols</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span>•</span>
                  <span>Your email is used for important notifications</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Update Profile Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Update Profile Information</h3>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center space-x-3">
                  <span className="text-red-600">❌</span>
                  <span className="text-red-800">{error}</span>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center space-x-3">
                  <span className="text-green-600">✅</span>
                  <span className="text-green-800">{success}</span>
                </div>
              )}

              <form onSubmit={handleUpdate} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your full name"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400">👤</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400">📧</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Email cannot be changed. Contact support if you need to update your email.
                  </p>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Leave password fields empty to keep your current password
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="Enter new password"
                          minLength="6"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-400">🔒</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          <span>{showPassword ? '🙈' : '👁️'}</span>
                        </button>
                      </div>

                      {/* Password Strength Indicator */}
                      {newPassword && (
                        <div className="mt-2">
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                                style={{ width: `${(passwordStrength / 5) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-gray-600">
                              {getPasswordStrengthText()}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Use 8+ characters with letters, numbers & symbols
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                            confirmPassword && newPassword !== confirmPassword
                              ? 'border-red-300 bg-red-50'
                              : 'border-gray-300'
                          }`}
                          placeholder="Confirm new password"
                          disabled={!newPassword}
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-400">🔐</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                          disabled={!newPassword}
                        >
                          <span>{showConfirmPassword ? '🙈' : '👁️'}</span>
                        </button>
                      </div>
                      {confirmPassword && newPassword !== confirmPassword && (
                        <div className="text-xs text-red-600 mt-1 flex items-center space-x-1">
                          <span>❌</span>
                          <span>Passwords do not match</span>
                        </div>
                      )}
                      {confirmPassword && newPassword === confirmPassword && confirmPassword.length > 0 && (
                        <div className="text-xs text-green-600 mt-1 flex items-center space-x-1">
                          <span>✅</span>
                          <span>Passwords match</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4 pt-6">
                  <button 
                    type="submit" 
                    disabled={updating || (newPassword && newPassword !== confirmPassword)}
                    className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                      updating || (newPassword && newPassword !== confirmPassword)
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {updating ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Updating...</span>
                      </div>
                    ) : (
                      'Update Profile'
                    )}
                  </button>
                  
                  <button 
                    type="button"
                    onClick={() => {
                      setNewName(profile.name);
                      setNewPassword('');
                      setConfirmPassword('');
                      setError('');
                      setSuccess('');
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </form>
            </div>

            {/* Account Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mt-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Account Actions</h3>
              
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Export Account Data</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Download a copy of all your account data including businesses and reviews.
                  </p>
                  <button 
                    onClick={handleExportData}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Export Data
                  </button>
                </div>

                <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <h4 className="font-semibold text-red-900 mb-2">Delete Account</h4>
                  <p className="text-sm text-red-700 mb-3">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <button 
                    onClick={handleDeleteAccount}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;