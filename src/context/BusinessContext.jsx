import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { buildUrl, API_ENDPOINTS } from '../config/api';

const BusinessContext = createContext();

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
};

export const BusinessProvider = ({ children }) => {
  const { token } = useAuth();
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all businesses for the user
  const fetchBusinesses = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(buildUrl(API_ENDPOINTS.BUSINESS.LIST), {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const businessList = response.data || [];
      setBusinesses(businessList);

      // Auto-select business logic
      const storedBusinessId = localStorage.getItem('selectedBusinessId');
      
      if (businessList.length === 0) {
        // No businesses - clear selection
        setSelectedBusiness(null);
        localStorage.removeItem('selectedBusinessId');
      } else if (storedBusinessId) {
        // Try to restore previously selected business
        const stored = businessList.find(b => b.id === parseInt(storedBusinessId));
        if (stored) {
          setSelectedBusiness(stored);
        } else {
          // Stored business not found, select first one
          setSelectedBusiness(businessList[0]);
          localStorage.setItem('selectedBusinessId', businessList[0].id);
        }
      } else {
        // No stored selection, auto-select first business
        setSelectedBusiness(businessList[0]);
        localStorage.setItem('selectedBusinessId', businessList[0].id);
      }
    } catch (err) {
      console.error('Error fetching businesses:', err);
      setError('Failed to load businesses');
      setBusinesses([]);
      setSelectedBusiness(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Select a business
  const selectBusiness = useCallback((business) => {
    setSelectedBusiness(business);
    if (business) {
      localStorage.setItem('selectedBusinessId', business.id);
    } else {
      localStorage.removeItem('selectedBusinessId');
    }
  }, []);

  // Clear selection
  const clearSelectedBusiness = useCallback(() => {
    setSelectedBusiness(null);
    localStorage.removeItem('selectedBusinessId');
  }, []);

  // Refresh businesses list
  const refreshBusinesses = useCallback(() => {
    return fetchBusinesses();
  }, [fetchBusinesses]);

  // Fetch businesses on mount or when token changes
  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  const value = {
    selectedBusiness,
    businesses,
    loading,
    error,
    selectBusiness,
    clearSelectedBusiness,
    refreshBusinesses,
  };

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
};