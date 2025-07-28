import React from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">Reputul</h1>
        {user && (
          <div className="flex items-center space-x-4">
            <span>Welcome, {user.name}</span>
            <button 
              onClick={logout}
              className="bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
