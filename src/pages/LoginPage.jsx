import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldAlert, 
  ArrowRight, 
  Star, 
  Check,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail
} from "lucide-react";

const LoginPage = () => {
  const { login, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Check for success message passed from Registration (e.g. "Registration successful!")
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear state so message doesn't persist on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Redirect if already logged in
  useEffect(() => {
    if (token) {
      navigate('/dashboard');
    }
  }, [token, navigate]);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setForm({ 
      ...form, 
      [name]: type === 'checkbox' ? checked : value 
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      await login(form.email, form.password, form.rememberMe);
      // Navigation happens automatically via the useEffect on 'token' or inside login function
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password. Please check your credentials.');
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
            <img src="/assets/reputul-logo.png" alt="Reputul Logo" className="h-8 w-auto" />
            <span className="text-2xl font-bold tracking-tight text-slate-900">Reputul</span>
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
            Welcome back
          </h2>
          <p className="text-slate-500 mb-8">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-[#7d2ae8] hover:text-[#6020b0] transition-colors">
              Sign up for free
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error & Success Messages */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3 text-sm text-red-600 animate-in fade-in slide-in-from-top-2">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            {successMessage && (
              <div className="p-3 bg-green-50 border border-green-100 rounded-lg flex items-start gap-3 text-sm text-green-700 animate-in fade-in slide-in-from-top-2">
                <Check className="w-5 h-5 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-purple-100 focus:border-[#7d2ae8] outline-none transition-all"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-purple-100 focus:border-[#7d2ae8] outline-none transition-all"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={form.rememberMe}
                    onChange={handleChange}
                    className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-slate-300 transition-all checked:border-[#7d2ae8] checked:bg-[#7d2ae8] hover:border-[#7d2ae8]"
                  />
                  <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100">
                    <Check size={10} strokeWidth={4} />
                  </div>
                </div>
                <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">
                  Remember me
                </span>
              </label>

              <Link 
                to="/forgot-password" 
                className="text-sm font-medium text-[#7d2ae8] hover:text-[#6020b0] hover:underline underline-offset-4 transition-all"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#7d2ae8] hover:bg-[#6020b0] text-white py-3.5 rounded-xl font-bold text-base transition-all shadow-lg shadow-purple-200 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
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
              "I used to spend hours chasing clients for reviews. With Reputul, it happens automatically while I sleep. Best investment ever."
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                SJ
              </div>
              <div>
                <div className="text-white font-bold">Sarah Jenkins</div>
                <div className="text-slate-400 text-sm">Director, Jenkins Roofing</div>
              </div>
            </div>
          </div>

          <div className="space-y-6 pl-2">
            <FeatureItem text="Access your unified inbox" />
            <FeatureItem text="Manage campaigns & requests" />
            <FeatureItem text="View real-time reputation analytics" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Reused Helper Component
const FeatureItem = ({ text }) => (
  <div className="flex items-center gap-3 text-slate-300">
    <div className="w-6 h-6 rounded-full bg-[#7d2ae8]/20 flex items-center justify-center shrink-0">
      <Check size={14} className="text-[#7d2ae8]" />
    </div>
    <span className="font-medium">{text}</span>
  </div>
);

export default LoginPage;