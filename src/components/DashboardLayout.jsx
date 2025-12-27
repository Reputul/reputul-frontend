import React from 'react';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-slate-50">
      <div className="flex-shrink-0 z-40">
        <Sidebar />
      </div>
      
      <div className="flex-1 flex flex-col relative">
        <header className="bg-white border-b border-slate-200 px-6 py-4 h-16 flex-shrink-0">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center space-x-4"></div>
            {/* Removed notification bell and search buttons - not needed for MVP */}
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