import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { token, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const navLinkClass = (path) => {
    const baseClass = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2";
    if (isActiveRoute(path)) {
      return `${baseClass} bg-blue-100 text-blue-700`;
    }
    return `${baseClass} text-gray-600 hover:text-blue-600 hover:bg-blue-50`;
  };

  const mobileNavLinkClass = (path) => {
    const baseClass = "block px-4 py-3 text-base font-medium rounded-lg transition-all duration-200";
    if (isActiveRoute(path)) {
      return `${baseClass} bg-blue-100 text-blue-700`;
    }
    return `${baseClass} text-gray-600 hover:text-blue-600 hover:bg-blue-50`;
  };

  // Don't show navbar on login/register pages
  if (['/login', '/register'].includes(location.pathname)) {
    return null;
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link to={token ? "/dashboard" : "/"} className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Reputul
                </span>
                <div className="text-xs text-gray-500 -mt-1">Reputation Management</div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {token ? (
              <>
                <Link to="/dashboard" className={navLinkClass('/dashboard')}>
                  <span>📊</span>
                  <span>Dashboard</span>
                </Link>
                <Link to="/profile" className={navLinkClass('/profile')}>
                  <span>👤</span>
                  <span>Profile</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className={navLinkClass('/login')}>
                  <span>🔑</span>
                  <span>Login</span>
                </Link>
                <Link to="/register" className={navLinkClass('/register')}>
                  <span>📝</span>
                  <span>Sign Up</span>
                </Link>
              </>
            )}
          </div>

          {/* User Menu & Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {token ? (
              <div className="flex items-center space-x-4">
                {/* User Info */}
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-8 h-8 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">
                      {user?.name || 'User'}
                    </div>
                    <div className="text-gray-500 text-xs">
                      {user?.email || ''}
                    </div>
                  </div>
                </div>
                
                {/* Logout Button */}
                <button 
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center space-x-2"
                >
                  <span>🚪</span>
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  to="/login"
                  className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-2">
            {token ? (
              <>
                {/* User Info */}
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg mb-3">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-10 h-10 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {user?.name || 'User'}
                    </div>
                    <div className="text-gray-500 text-sm">
                      {user?.email || ''}
                    </div>
                  </div>
                </div>

                {/* Navigation Links */}
                <Link 
                  to="/dashboard" 
                  className={mobileNavLinkClass('/dashboard')}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  📊 Dashboard
                </Link>
                <Link 
                  to="/profile" 
                  className={mobileNavLinkClass('/profile')}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  👤 Profile
                </Link>

                {/* Logout Button */}
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                >
                  🚪 Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className={mobileNavLinkClass('/login')}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  🔑 Login
                </Link>
                <Link 
                  to="/register" 
                  className={mobileNavLinkClass('/register')}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  📝 Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;