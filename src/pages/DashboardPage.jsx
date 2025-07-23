import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { token } = useAuth();
  const [businesses, setBusinesses] = useState([]);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/dashboard', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setBusinesses(response.data);
      } catch (error) {
        console.error('Error fetching businesses:', error);
      }
    };

    if (token) {
      fetchBusinesses();
    }
  }, [token]);

  return (
    <div>
      <h1>Your Businesses</h1>
      {businesses.length === 0 ? (
        <p>No businesses found.</p>
      ) : (
        <ul>
          {businesses.map((business) => (
            <li key={business.id}>
              <strong>{business.name}</strong> – Reputation Score: {business.reputationScore ?? 'N/A'} – Badge: {business.badge ?? 'None'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DashboardPage;
