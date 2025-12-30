import React from 'react';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-slate-50">
      <div className="flex-shrink-0 z-40">
        <Sidebar />
      </div>
      
      <div className="flex-1 flex flex-col relative">
        {/* REMOVED: Empty header section */}

        <div 
          className="absolute top-0 bottom-0 left-0 right-0 overflow-y-scroll bg-slate-50"
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