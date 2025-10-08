import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { buildUrl } from '../config/api';

const OAuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      console.log('OAuth Callback received:', { code: code ? 'present' : 'missing', state, error });

      if (error) {
        setStatus('error');
        setMessage(`OAuth failed: ${error}`);
        setTimeout(() => navigate('/review-platforms'), 3000);
        return;
      }

      if (!code || !state) {
        setStatus('error');
        setMessage('Invalid OAuth callback - missing code or state');
        setTimeout(() => navigate('/review-platforms'), 3000);
        return;
      }

      try {
        console.log('Sending code to backend...');
        
        const response = await axios.post(
          buildUrl('/api/v1/platforms/callback/google'),
          { code, state },
          { headers: { Authorization: `Bearer ${token}` }}
        );

        console.log('Backend response:', response.data);

        if (response.data.success) {
          setStatus('success');
          setMessage('Platform connected successfully!');
          setTimeout(() => navigate('/review-platforms'), 2000);
        } else {
          throw new Error(response.data.error || 'Connection failed');
        }
      } catch (err) {
        console.error('OAuth callback error:', err);
        setStatus('error');
        setMessage(err.response?.data?.error || 'Failed to connect platform');
        setTimeout(() => navigate('/review-platforms'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        {status === 'processing' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Connecting Platform...</h2>
            <p className="text-gray-600">Please wait while we complete the connection</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-xl font-semibold text-green-900 mb-2">Connected Successfully!</h2>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500 mt-2">Redirecting you back...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-xl font-semibold text-red-900 mb-2">Connection Failed</h2>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500 mt-2">Redirecting you back...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default OAuthCallbackPage;