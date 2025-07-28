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
  const [focusedField, setFocusedField] = useState('');
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
    if (passwordStrength <= 1) return 'from-red-500 to-red-600';
    if (passwordStrength <= 2) return 'from-yellow-500 to-orange-500';
    if (passwordStrength <= 3) return 'from-blue-500 to-blue-600';
    return 'from-green-500 to-emerald-600';
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200"></div>
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-600 border-t-transparent absolute top-0"></div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading Your Profile</h2>
          <p className="text-blue-200">Fetching your account information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-400/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10 min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* Enhanced Header */}
          <div className="text-center mb-12 animate-fade-in-up">
            <div className="flex justify-center mb-6">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition-all duration-300"></div>
                <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-105 transition-all duration-300">
                  <span className="text-white text-3xl font-black">
                    {profile.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-3xl"></div>
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-400 rounded-full border-4 border-slate-900 shadow-lg"></div>
              </div>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-white mb-4 tracking-tight">
              Profile Settings
            </h1>
            <p className="text-xl text-blue-100 font-medium max-w-2xl mx-auto">
              Manage your account information, security settings, and preferences
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Enhanced Sidebar */}
            <div className="lg:col-span-1 space-y-6 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              {/* Account Overview */}
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Account Overview</h3>
                </div>
                
                <div className="space-y-5">
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl">
                    <div className="bg-blue-100 rounded-xl p-3">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900">{profile.name}</div>
                      <div className="text-sm text-gray-600">Account Name</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl">
                    <div className="bg-green-100 rounded-xl p-3">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900">{profile.email}</div>
                      <div className="text-sm text-gray-600">Email Address</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl">
                    <div className="bg-purple-100 rounded-xl p-3">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0v1m6-1v1m-6 0a2 2 0 00-2 2v3a2 2 0 002 2h4a2 2 0 002-2v-3a2 2 0 00-2-2" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900">
                        {accountStats.joinDate.toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-600">Member Since</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Statistics */}
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Your Statistics</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-600 rounded-xl p-2">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <span className="font-bold text-gray-900">Businesses</span>
                    </div>
                    <span className="text-2xl font-black text-blue-600">
                      {accountStats.businessCount}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-2xl border border-green-200">
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-600 rounded-xl p-2">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <span className="font-bold text-gray-900">Total Reviews</span>
                    </div>
                    <span className="text-2xl font-black text-green-600">
                      {accountStats.totalReviews}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-2xl border border-yellow-200">
                    <div className="flex items-center space-x-3">
                      <div className="bg-yellow-600 rounded-xl p-2">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      </div>
                      <span className="font-bold text-gray-900">Avg Rating</span>
                    </div>
                    <span className="text-2xl font-black text-yellow-600">
                      {accountStats.averageRating}
                    </span>
                  </div>
                </div>
              </div>

              {/* Enhanced Tips */}
              <div className="bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10 backdrop-blur-lg rounded-3xl border border-green-200/30 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-green-100 rounded-2xl p-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white">Security Tips</h3>
                </div>
                <ul className="text-green-100 space-y-3">
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Keep your profile information up to date for better security</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Use a strong password with numbers, letters, and symbols</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Your email is used for important account notifications</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Enhanced Main Content */}
            <div className="lg:col-span-2 space-y-8 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              {/* Update Profile Form */}
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-10">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Update Profile Information</h3>
                </div>
                
                {error && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 mb-8 flex items-center space-x-4 animate-shake">
                    <div className="bg-red-100 rounded-full p-2">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <span className="text-red-800 font-semibold">{error}</span>
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-5 mb-8 flex items-center space-x-4 animate-bounce">
                    <div className="bg-green-100 rounded-full p-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    <span className="text-green-800 font-semibold">{success}</span>
                  </div>
                )}

                <form onSubmit={handleUpdate} className="space-y-8">
                  <div className="space-y-6">
                    {/* Name Field */}
                    <div className="relative group">
                      <label className="block text-sm font-bold text-gray-900 mb-3">
                        Full Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          onFocus={() => setFocusedField('name')}
                          onBlur={() => setFocusedField('')}
                          required
                          className={`w-full pl-14 pr-4 py-4 border-2 rounded-2xl transition-all duration-300 text-lg font-medium ${
                            focusedField === 'name' 
                              ? 'border-purple-500 ring-4 ring-purple-500/20 shadow-lg' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          placeholder="Enter your full name"
                        />
                        <div className={`absolute inset-y-0 left-0 pl-5 flex items-center transition-all duration-300 ${
                          focusedField === 'name' ? 'transform scale-110' : ''
                        }`}>
                          <svg className={`w-6 h-6 ${focusedField === 'name' ? 'text-purple-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Email Field */}
                    <div className="relative group">
                      <label className="block text-sm font-bold text-gray-900 mb-3">
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={profile.email}
                          disabled
                          className="w-full pl-14 pr-4 py-4 border-2 border-gray-200 rounded-2xl bg-gray-50 text-gray-500 cursor-not-allowed text-lg font-medium"
                        />
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-3 bg-blue-50 rounded-xl p-3 border border-blue-200">
                        <svg className="w-4 h-4 text-blue-600 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Email cannot be changed. Contact support if you need to update your email address.
                      </p>
                    </div>
                  </div>

                  {/* Password Section */}
                  <div className="border-t-2 border-gray-200 pt-8">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl p-2">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <h4 className="text-xl font-bold text-gray-900">Security Settings</h4>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-4 mb-6 border border-amber-200">
                      <p className="text-amber-800 font-medium">
                        <svg className="w-4 h-4 text-amber-600 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Leave password fields empty to keep your current password
                      </p>
                    </div>
                    
                    <div className="space-y-6">
                      {/* New Password */}
                      <div className="relative group">
                        <label className="block text-sm font-bold text-gray-900 mb-3">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            onFocus={() => setFocusedField('password')}
                            onBlur={() => setFocusedField('')}
                            className={`w-full pl-14 pr-14 py-4 border-2 rounded-2xl transition-all duration-300 text-lg font-medium ${
                              focusedField === 'password' 
                                ? 'border-purple-500 ring-4 ring-purple-500/20 shadow-lg' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            placeholder="Enter new password"
                            minLength="6"
                          />
                          <div className={`absolute inset-y-0 left-0 pl-5 flex items-center transition-all duration-300 ${
                            focusedField === 'password' ? 'transform scale-110' : ''
                          }`}>
                            <svg className={`w-6 h-6 ${focusedField === 'password' ? 'text-purple-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-400 hover:text-gray-600 transition-colors group"
                          >
                            <div className="group-hover:scale-110 transition-transform">
                              {showPassword ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M9.878 9.878L12 12m0 0l2.122 2.122M15 12l2.122 2.122M12 12l-3-3m0 0L6.464 6.464M9 9L6.464 6.464" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              )}
                            </div>
                          </button>
                        </div>

                        {/* Enhanced Password Strength */}
                        {newPassword && (
                          <div className="mt-4 space-y-3">
                            <div className="flex items-center space-x-3">
                              <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                                <div 
                                  className={`h-full bg-gradient-to-r ${getPasswordStrengthColor()} transition-all duration-500 shadow-sm`}
                                  style={{ width: `${(passwordStrength / 5) * 100}%` }}
                                />
                              </div>
                              <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                                passwordStrength <= 1 ? 'bg-red-100 text-red-800' :
                                passwordStrength <= 2 ? 'bg-yellow-100 text-yellow-800' :
                                passwordStrength <= 3 ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {getPasswordStrengthText()}
                              </span>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                              <div className="text-sm font-medium text-gray-700 mb-3">Password requirements:</div>
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className={`flex items-center space-x-2 ${newPassword.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                                  <span>{newPassword.length >= 8 ? '✓' : '○'}</span>
                                  <span>8+ characters</span>
                                </div>
                                <div className={`flex items-center space-x-2 ${/[A-Z]/.test(newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                                  <span>{/[A-Z]/.test(newPassword) ? '✓' : '○'}</span>
                                  <span>Uppercase letter</span>
                                </div>
                                <div className={`flex items-center space-x-2 ${/[a-z]/.test(newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                                  <span>{/[a-z]/.test(newPassword) ? '✓' : '○'}</span>
                                  <span>Lowercase letter</span>
                                </div>
                                <div className={`flex items-center space-x-2 ${/\d/.test(newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                                  <span>{/\d/.test(newPassword) ? '✓' : '○'}</span>
                                  <span>Number</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div className="relative group">
                        <label className="block text-sm font-bold text-gray-900 mb-3">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            onFocus={() => setFocusedField('confirmPassword')}
                            onBlur={() => setFocusedField('')}
                            className={`w-full pl-14 pr-14 py-4 border-2 rounded-2xl transition-all duration-300 text-lg font-medium ${
                              focusedField === 'confirmPassword' 
                                ? 'border-purple-500 ring-4 ring-purple-500/20 shadow-lg' 
                                : confirmPassword && newPassword !== confirmPassword
                                  ? 'border-red-300 bg-red-50'
                                  : 'border-gray-200 hover:border-gray-300'
                            }`}
                            placeholder="Confirm new password"
                            disabled={!newPassword}
                          />
                          <div className={`absolute inset-y-0 left-0 pl-5 flex items-center transition-all duration-300 ${
                            focusedField === 'confirmPassword' ? 'transform scale-110' : ''
                          }`}>
                            <svg className={`w-6 h-6 ${
                              focusedField === 'confirmPassword' ? 'text-purple-500' : 
                              confirmPassword && newPassword !== confirmPassword ? 'text-red-500' : 'text-gray-400'
                            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-400 hover:text-gray-600 transition-colors group"
                            disabled={!newPassword}
                          >
                            <div className="group-hover:scale-110 transition-transform">
                              {showConfirmPassword ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M9.878 9.878L12 12m0 0l2.122 2.122M15 12l2.122 2.122M12 12l-3-3m0 0L6.464 6.464M9 9L6.464 6.464" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              )}
                            </div>
                          </button>
                        </div>
                        {confirmPassword && (
                          <div className="mt-3">
                            {newPassword !== confirmPassword ? (
                              <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-200">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <span className="text-sm font-medium">Passwords do not match</span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-4 py-3 rounded-xl border border-green-200">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-sm font-medium">Passwords match perfectly!</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-4 pt-8">
                    <button 
                      type="submit" 
                      disabled={updating || (newPassword && newPassword !== confirmPassword)}
                      className={`flex-1 py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 transform ${
                        updating || (newPassword && newPassword !== confirmPassword)
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed scale-95'
                          : 'bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white shadow-2xl hover:shadow-3xl hover:scale-105 active:scale-95'
                      }`}
                    >
                      {updating ? (
                        <div className="flex items-center justify-center space-x-3">
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                          <span>Updating Profile...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-3">
                          <span>Update Profile</span>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
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
                      className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
                    >
                      Reset
                    </button>
                  </div>
                </form>
              </div>

              {/* Enhanced Account Actions */}
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-10">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Account Actions</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="p-6 border-2 border-blue-200 rounded-2xl bg-gradient-to-r from-blue-50 to-blue-100">
                    <div className="flex items-start space-x-4">
                      <div className="bg-blue-600 rounded-xl p-3">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-lg mb-2">Export Account Data</h4>
                        <p className="text-gray-700 mb-4">
                          Download a complete copy of all your account data including businesses, reviews, and analytics. This includes everything associated with your account.
                        </p>
                        <button 
                          onClick={handleExportData}
                          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                        >
                          Download Data Export
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 border-2 border-red-200 rounded-2xl bg-gradient-to-r from-red-50 to-red-100">
                    <div className="flex items-start space-x-4">
                      <div className="bg-red-600 rounded-xl p-3">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-red-900 text-lg mb-2">Delete Account</h4>
                        <p className="text-red-700 mb-4">
                          Permanently delete your account and all associated data including businesses, reviews, and analytics. <strong>This action cannot be undone.</strong>
                        </p>
                        <div className="bg-red-100 rounded-xl p-4 mb-4 border border-red-200">
                          <p className="text-red-800 text-sm font-medium">
                            ⚠️ Warning: This will permanently remove all your data from our servers. Make sure to export your data first if you need it.
                          </p>
                        </div>
                        <button 
                          onClick={handleDeleteAccount}
                          className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                        >
                          Delete Account Permanently
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;