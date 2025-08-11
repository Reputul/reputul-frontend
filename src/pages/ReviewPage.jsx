import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const ReviewPage = () => {
  const { businessId } = useParams();
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';
  const [business, setBusiness] = useState(null);
  const [form, setForm] = useState({ rating: '', comment: '' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/businesses/${businessId}`);
        setBusiness(res.data);
      } catch (err) {
        console.error('Error fetching business:', err);
        setError('Business not found.');
      }
    };

    fetchBusiness();
  }, [businessId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post(`${API_BASE}/api/public/reviews/${businessId}`, form);
      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Something went wrong. Please try again.');
    }
  };

  if (error) return <p style={{ padding: '2rem', color: 'red' }}>{error}</p>;
  if (!business) return <p style={{ padding: '2rem' }}>Loading...</p>;
  if (submitted) return <p style={{ padding: '2rem' }}>✅ Thank you for your review!</p>;

  return (
    <div style={{ padding: '2rem', maxWidth: '600px' }}>
      <h2>Leave a Review for {business.name}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Rating (1-5):</label><br />
          <input
            type="number"
            name="rating"
            min="1"
            max="5"
            value={form.rating}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div>
          <label>Comment:</label><br />
          <textarea
            name="comment"
            value={form.comment}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <button type="submit" style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
          Submit Review
        </button>
      </form>
    </div>
  );
};

export default ReviewPage;
