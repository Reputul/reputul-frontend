import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { token } = useAuth();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({}); // keyed by businessId

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/dashboard', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setBusinesses(res.data);
      } catch (err) {
        console.error('Error fetching businesses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, [token]);

  const handleChange = (businessId, e) => {
    setFormData({
      ...formData,
      [businessId]: {
        ...formData[businessId],
        [e.target.name]: e.target.value,
      }
    });
  };

  const handleSubmit = async (businessId) => {
    const data = formData[businessId];
    try {
      await axios.post(`http://localhost:8080/api/reviews/${businessId}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      alert('Review submitted!');
    } catch (err) {
      console.error(err);
      alert('Error submitting review.');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Your Businesses</h2>
      {loading ? (
        <p>Loading...</p>
      ) : businesses.length === 0 ? (
        <p>No businesses found.</p>
      ) : (
        businesses.map((biz) => (
          <div key={biz.id} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '2rem' }}>
            <strong>{biz.name}</strong> <br />
            Industry: {biz.industry} <br />
            Phone: {biz.phone} <br />
            Website: <a href={biz.website}>{biz.website}</a> <br />
            Address: {biz.address} <br />
            Reputation Score: {biz.reputationScore} <br />
            Badge: {biz.badge || 'None'} <br />
            Reviews: {biz.reviewCount}

            {/* Manual Review Form */}
            <h4 style={{ marginTop: '1rem' }}>Submit a Review</h4>
            <input
              type="number"
              name="rating"
              placeholder="Rating (1-5)"
              onChange={(e) => handleChange(biz.id, e)}
              style={{ marginBottom: '0.5rem', width: '100%' }}
            />
            <textarea
              name="comment"
              placeholder="Comment"
              onChange={(e) => handleChange(biz.id, e)}
              style={{ marginBottom: '0.5rem', width: '100%', height: '60px' }}
            />
            <input
              type="text"
              name="source"
              placeholder="Source (e.g. Google)"
              onChange={(e) => handleChange(biz.id, e)}
              style={{ marginBottom: '0.5rem', width: '100%' }}
            />
            <button onClick={() => handleSubmit(biz.id)}>
              Submit Review
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default DashboardPage;
