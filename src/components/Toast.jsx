// src/components/Toast.jsx
import React from 'react';
import { useToast } from '../context/ToastContext';

const Toast = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  const getToastStyle = (type) => {
    const baseStyle = {
      padding: '12px 20px',
      margin: '8px 0',
      borderRadius: '4px',
      color: 'white',
      position: 'relative',
      cursor: 'pointer',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      minWidth: '300px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    };

    const typeStyles = {
      success: { backgroundColor: '#4CAF50' },
      error: { backgroundColor: '#f44336' },
      warning: { backgroundColor: '#ff9800' },
      info: { backgroundColor: '#2196F3' }
    };

    return { ...baseStyle, ...typeStyles[type] };
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 1000
    }}>
      {toasts.map(toast => (
        <div
          key={toast.id}
          style={getToastStyle(toast.type)}
          onClick={() => removeToast(toast.id)}
        >
          <span>{toast.message}</span>
          <span style={{ marginLeft: '10px', cursor: 'pointer' }}>×</span>
        </div>
      ))}
    </div>
  );
};

export default Toast;