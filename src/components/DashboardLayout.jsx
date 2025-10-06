import React from 'react';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-slate-50">
      <div className="flex-shrink-0 z-40">  {/* ← Removed w-64 */}
        <Sidebar />
      </div>
      
      <div className="flex-1 flex flex-col relative">
        <header className="bg-white border-b border-slate-200 px-6 py-4 h-16 flex-shrink-0">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center space-x-4"></div>
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors relative">
                <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        <div 
          className="absolute top-16 bottom-0 left-0 right-0 overflow-y-scroll bg-slate-50"
          style={{ 
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain'
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;