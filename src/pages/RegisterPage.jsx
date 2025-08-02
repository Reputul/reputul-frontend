import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { buildUrl, API_ENDPOINTS } from '../config/api';

const RegisterPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [focusedField, setFocusedField] = useState('');

  useEffect(() => {
    if (token) {
      navigate('/dashboard');
    }
  }, [token, navigate]);

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
    
    setPasswordStrength(calculateStrength(form.password));
  }, [form.password]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

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

  const getFieldValidation = (field) => {
    switch (field) {
      case 'name':
        return form.name.length >= 2;
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
      case 'password':
        return form.password.length >= 8;
      case 'confirmPassword':
        return form.confirmPassword && form.password === form.confirmPassword;
      default:
        return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    // Enhanced password strength validation
    const passwordStrengthChecks = [
      { test: /[a-z]/, message: 'lowercase letter' },
      { test: /[A-Z]/, message: 'uppercase letter' },
      { test: /\d/, message: 'number' },
      { test: /[^a-zA-Z\d]/, message: 'special character' }
    ];

    const failedChecks = passwordStrengthChecks.filter(check => !check.test.test(form.password));
    if (failedChecks.length > 0) {
      setError(`Password must contain at least one ${failedChecks.map(c => c.message).join(', ')}`);
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await axios.post(buildUrl(API_ENDPOINTS.AUTH.REGISTER), {
        name: form.name,
        email: form.email,
        password: form.password
      });
      
      // Show success message and redirect
      alert('Registration successful! Please login with your credentials.');
      navigate('/login');
    } catch (err) {
      const errorMessage = err.response?.data || 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = form.name && form.email && form.password && form.password === form.confirmPassword && form.password.length >= 8;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/20 via-pink-600/20 to-blue-600/20"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-400/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Enhanced Logo and Header */}
          <div className="text-center mb-10 animate-fade-in-up">
            <div className="flex justify-center mb-6">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition-all duration-300"></div>
                <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-blue-700 p-6 rounded-3xl shadow-2xl transform group-hover:scale-105 transition-all duration-300">
                  <div className="text-white font-black text-4xl">R</div>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-3xl"></div>
                </div>
              </div>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-white mb-3 tracking-tight">
              Join Reputul
            </h1>
            <p className="text-xl text-purple-100 font-medium">
              Start managing your business reputation today
            </p>
            <div className="mt-4 flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>

          {/* Enhanced Registration Form */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 lg:p-10 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 flex items-center space-x-4 animate-shake">
                  <div className="bg-red-100 rounded-full p-2">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <span className="text-red-800 font-semibold">{error}</span>
                </div>
              )}

              <div className="space-y-5">
                {/* Full Name Field */}
                <div className="relative group">
                  <label className="block text-sm font-bold text-gray-900 mb-3">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
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
                    {getFieldValidation('name') && (
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                        <svg className="w-5 h-5 text-green-500 animate-scale-in" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
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
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField('')}
                      required
                      className={`w-full pl-14 pr-4 py-4 border-2 rounded-2xl transition-all duration-300 text-lg font-medium ${
                        focusedField === 'email' 
                          ? 'border-purple-500 ring-4 ring-purple-500/20 shadow-lg' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="Enter your email address"
                    />
                    <div className={`absolute inset-y-0 left-0 pl-5 flex items-center transition-all duration-300 ${
                      focusedField === 'email' ? 'transform scale-110' : ''
                    }`}>
                      <svg className={`w-6 h-6 ${focusedField === 'email' ? 'text-purple-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    {getFieldValidation('email') && (
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                        <svg className="w-5 h-5 text-green-500 animate-scale-in" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                {/* Password Field */}
                <div className="relative group">
                  <label className="block text-sm font-bold text-gray-900 mb-3">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField('')}
                      required
                      className={`w-full pl-14 pr-14 py-4 border-2 rounded-2xl transition-all duration-300 text-lg font-medium ${
                        focusedField === 'password' 
                          ? 'border-purple-500 ring-4 ring-purple-500/20 shadow-lg' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="Create a strong password"
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
                  
                  {/* Enhanced Password Strength Indicator */}
                  {form.password && (
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
                      <div className="bg-gray-50 rounded-xl p-3">
                        <div className="text-xs font-medium text-gray-700 mb-2">Password requirements (all required):</div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className={`flex items-center space-x-1 ${form.password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                            <span>{form.password.length >= 8 ? '✓' : '○'}</span>
                            <span>8+ characters</span>
                          </div>
                          <div className={`flex items-center space-x-1 ${/[A-Z]/.test(form.password) ? 'text-green-600' : 'text-gray-400'}`}>
                            <span>{/[A-Z]/.test(form.password) ? '✓' : '○'}</span>
                            <span>Uppercase</span>
                          </div>
                          <div className={`flex items-center space-x-1 ${/[a-z]/.test(form.password) ? 'text-green-600' : 'text-gray-400'}`}>
                            <span>{/[a-z]/.test(form.password) ? '✓' : '○'}</span>
                            <span>Lowercase</span>
                          </div>
                          <div className={`flex items-center space-x-1 ${/\d/.test(form.password) ? 'text-green-600' : 'text-gray-400'}`}>
                            <span>{/\d/.test(form.password) ? '✓' : '○'}</span>
                            <span>Number</span>
                          </div>
                          <div className={`flex items-center space-x-1 ${/[^a-zA-Z\d]/.test(form.password) ? 'text-green-600' : 'text-gray-400'}`}>
                            <span>{/[^a-zA-Z\d]/.test(form.password) ? '✓' : '○'}</span>
                            <span>Special char</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="relative group">
                  <label className="block text-sm font-bold text-gray-900 mb-3">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('confirmPassword')}
                      onBlur={() => setFocusedField('')}
                      required
                      className={`w-full pl-14 pr-14 py-4 border-2 rounded-2xl transition-all duration-300 text-lg font-medium ${
                        focusedField === 'confirmPassword' 
                          ? 'border-purple-500 ring-4 ring-purple-500/20 shadow-lg' 
                          : form.confirmPassword && form.password !== form.confirmPassword
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="Confirm your password"
                    />
                    <div className={`absolute inset-y-0 left-0 pl-5 flex items-center transition-all duration-300 ${
                      focusedField === 'confirmPassword' ? 'transform scale-110' : ''
                    }`}>
                      <svg className={`w-6 h-6 ${
                        focusedField === 'confirmPassword' ? 'text-purple-500' : 
                        form.confirmPassword && form.password !== form.confirmPassword ? 'text-red-500' : 'text-gray-400'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-400 hover:text-gray-600 transition-colors group"
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
                  {form.confirmPassword && (
                    <div className="mt-2">
                      {form.password !== form.confirmPassword ? (
                        <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span className="text-sm font-medium">Passwords do not match</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg">
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

              <button 
                type="submit" 
                disabled={loading || !isFormValid}
                className={`relative w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 transform ${
                  loading || !isFormValid
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed scale-95'
                    : 'bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white shadow-2xl hover:shadow-3xl hover:scale-105 active:scale-95'
                } overflow-hidden`}
              >
                {!loading && !isFormValid && (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-50"></div>
                )}
                {loading && (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 animate-pulse"></div>
                )}
                <div className="relative flex items-center justify-center space-x-3">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                      <span>Creating your account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Your Account</span>
                      <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </>
                  )}
                </div>
              </button>
            </form>

            {/* Enhanced Terms and Privacy */}
            <div className="mt-8 text-center text-sm text-gray-600 bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">Secure & Private</span>
              </div>
              <div>
                By creating an account, you agree to our{' '}
                <a href="#" className="text-purple-600 hover:text-purple-700 underline font-medium">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-purple-600 hover:text-purple-700 underline font-medium">
                  Privacy Policy
                </a>
              </div>
            </div>

            {/* Enhanced Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-6 bg-white text-gray-500 font-medium">Already have an account?</span>
              </div>
            </div>

            {/* Enhanced Sign In Link */}
            <div className="text-center">
              <Link 
                to="/login" 
                className="group inline-flex items-center space-x-3 text-purple-600 hover:text-purple-700 font-bold text-lg transition-all duration-300 transform hover:scale-105"
              >
                <span>Sign in here</span>
                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Enhanced Features Preview */}
          <div className="mt-10 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
            <h3 className="text-2xl font-bold text-white text-center mb-8">What you'll get with Reputul</h3>
            <div className="space-y-4">
              <div className="group bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center space-x-6">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg flex-shrink-0">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-bold text-white mb-2">Comprehensive Analytics</div>
                    <div className="text-purple-100">Track reputation trends, performance metrics, and customer insights in real-time</div>
                  </div>
                </div>
              </div>
              
              <div className="group bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center space-x-6">
                  <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg flex-shrink-0">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-bold text-white mb-2">Smart Review Management</div>
                    <div className="text-purple-100">Collect, respond to, and showcase customer reviews across all platforms</div>
                  </div>
                </div>
              </div>
              
              <div className="group bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center space-x-6">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg flex-shrink-0">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-bold text-white mb-2">Beautiful Public Profiles</div>
                    <div className="text-purple-100">Professional, shareable pages that showcase your reputation to customers</div>
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
        
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0);
          }
          to {
            opacity: 1;
            transform: scale(1);
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
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out forwards;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default RegisterPage;