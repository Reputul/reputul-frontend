import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { buildUrl, API_ENDPOINTS } from '../config/api';
import { 
  CheckCircle, 
  ShieldAlert, 
  ArrowRight, 
  Star, 
  Check,
  Eye,
  EyeOff,
  Loader2,
  Smartphone // Added icon for phone field
} from "lucide-react";

const RegisterPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  // Updated state to include phone
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '', // <--- NEW FIELD
    password: '',
    confirmPassword: ''
  });

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false
  });

  useEffect(() => {
    if (token) {
      navigate('/dashboard');
    }
  }, [token, navigate]);

  useEffect(() => {
    setPasswordCriteria({
      length: form.password.length >= 8,
      uppercase: /[A-Z]/.test(form.password),
      number: /\d/.test(form.password),
      special: /[^a-zA-Z\d]/.test(form.password)
    });
  }, [form.password]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!Object.values(passwordCriteria).every(Boolean)) {
      setError('Please meet all password requirements');
      return;
    }

    if (!agreedToTerms) {
      setError('You must agree to the Terms and SMS opt-in to continue');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Updated API call to include phone
      await axios.post(buildUrl(API_ENDPOINTS.AUTH.REGISTER), {
        name: form.name,
        email: form.email,
        phone: form.phone, // <--- SENDING PHONE TO BACKEND
        password: form.password
      });
      
      navigate('/login', { state: { message: 'Registration successful! Please login.' } });
    } catch (err) {
      const errorMessage = err.response?.data || 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex font-sans text-slate-900 selection:bg-[#7d2ae8] selection:text-white">
      
      {/* LEFT SIDE: Form Section */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 py-12 bg-white relative">
        <div className="w-full max-w-sm mx-auto lg:w-96">
          
          {/* Logo Section */}
          <div className="flex items-center gap-3 mb-10">
            <img src="/assets/logos/reputul-logo.svg" alt="Reputul Logo" className="h-8 w-auto" />
            <span className="text-2xl font-bold tracking-tight text-slate-900">Reputul</span>
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
            Start your 14-day free trial
          </h2>
          <p className="text-slate-500 mb-8">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#7d2ae8] hover:text-[#6020b0] transition-colors">
              Sign in
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3 text-sm text-red-600">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-purple-100 focus:border-[#7d2ae8] outline-none transition-all"
                placeholder="John Doe"
              />
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Work Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-purple-100 focus:border-[#7d2ae8] outline-none transition-all"
                placeholder="john@company.com"
              />
            </div>

            {/* NEW: Phone Input */}
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Mobile Phone
              </label>
              <div className="relative">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-purple-100 focus:border-[#7d2ae8] outline-none transition-all"
                  placeholder="(555) 123-4567"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Smartphone size={18} />
                </div>
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-10 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-purple-100 focus:border-[#7d2ae8] outline-none transition-all"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {form.password.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Requirement label="8+ Characters" met={passwordCriteria.length} />
                  <Requirement label="Uppercase" met={passwordCriteria.uppercase} />
                  <Requirement label="Number" met={passwordCriteria.number} />
                  <Requirement label="Special Char" met={passwordCriteria.special} />
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={form.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all ${
                  form.confirmPassword && form.password !== form.confirmPassword 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-slate-200 focus:border-[#7d2ae8]'
                }`}
                placeholder="Confirm password"
              />
            </div>

            {/* Compliance Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center mt-1">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 transition-all checked:border-[#7d2ae8] checked:bg-[#7d2ae8] hover:border-[#7d2ae8]"
                  />
                  <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100">
                    <Check size={14} strokeWidth={3} />
                  </div>
                </div>
                <span className="text-xs text-slate-500 leading-relaxed group-hover:text-slate-600 transition-colors">
                  I agree to the <a href="#" className="underline decoration-slate-300 underline-offset-2 hover:text-[#7d2ae8]">Terms of Service</a> and <a href="#" className="underline decoration-slate-300 underline-offset-2 hover:text-[#7d2ae8]">Privacy Policy</a>. 
                  I also consent to receive SMS account alerts and security notifications from Reputul. Message frequency varies. Reply STOP to opt out.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#7d2ae8] hover:bg-[#6020b0] text-white py-3.5 rounded-xl font-bold text-base transition-all shadow-lg shadow-purple-200 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT SIDE: Branding & Social Proof */}
      <div className="hidden lg:flex flex-1 relative bg-slate-900 overflow-hidden flex-col justify-center px-20">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#7d2ae8] rounded-full mix-blend-multiply filter blur-[120px] opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-10"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

        <div className="relative z-10 max-w-lg">
          <div className="bg-white/10 backdrop-blur-md border border-white/10 p-8 rounded-3xl mb-12 shadow-2xl">
            <div className="flex gap-1 mb-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={20} className="text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <p className="text-xl text-white font-medium leading-relaxed mb-6">
              "We went from 12 reviews to over 150 in just two months. Reputul is the only tool that actually gets customers to take action."
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                MS
              </div>
              <div>
                <div className="text-white font-bold">Mike Stevenson</div>
                <div className="text-slate-400 text-sm">Owner, Stevenson Plumbing</div>
              </div>
            </div>
          </div>

          <div className="space-y-6 pl-2">
            <FeatureItem text="Get found on Google Maps automatically" />
            <FeatureItem text="Intercept negative feedback privately" />
            <FeatureItem text="No credit card required for trial" />
          </div>
        </div>
      </div>
    </div>
  );
};

const Requirement = ({ label, met }) => (
  <div className={`flex items-center gap-2 text-xs transition-colors ${met ? 'text-green-600' : 'text-slate-400'}`}>
    <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${
      met ? 'bg-green-100 border-green-200' : 'bg-slate-100 border-slate-200'
    }`}>
      {met && <Check size={10} />}
    </div>
    <span className={met ? 'font-medium' : ''}>{label}</span>
  </div>
);

const FeatureItem = ({ text }) => (
  <div className="flex items-center gap-3 text-slate-300">
    <div className="w-6 h-6 rounded-full bg-[#7d2ae8]/20 flex items-center justify-center shrink-0">
      <Check size={14} className="text-[#7d2ae8]" />
    </div>
    <span className="font-medium">{text}</span>
  </div>
);

export default RegisterPage;