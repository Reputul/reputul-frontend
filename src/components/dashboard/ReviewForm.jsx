import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { buildUrl, API_ENDPOINTS } from '../../config/api';

const ReviewForm = React.memo(({ businessId, token, fetchBusinesses, fetchMetrics }) => {
  const [localRating, setLocalRating] = useState("");
  const [localComment, setLocalComment] = useState("");

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!localRating || !localComment) {
        alert("Please fill in both rating and comment");
        return;
      }

      try {
        await axios.post(
          buildUrl(API_ENDPOINTS.REVIEWS.MANUAL(businessId)),
          { rating: localRating, comment: localComment },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setLocalRating("");
        setLocalComment("");
        alert("Review added successfully!");
        fetchBusinesses();
        fetchMetrics();
      } catch (err) {
        console.error("Error submitting review:", err);
        alert("Failed to add review");
      }
    },
    [businessId, localRating, localComment, token, fetchBusinesses, fetchMetrics]
  );

  return (
    <div
      id={`review-form-${businessId}`}
      className="bg-gray-50 rounded-lg p-4 mb-4"
    >
      <h5 className="text-sm font-semibold text-gray-900 mb-3">
        Add Manual Review
      </h5>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-4 gap-3">
          <select
            name="rating"
            value={localRating}
            onChange={(e) => setLocalRating(e.target.value)}
            required
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
          >
            <option value="">Rating</option>
            <option value="5">5 ⭐</option>
            <option value="4">4 ⭐</option>
            <option value="3">3 ⭐</option>
            <option value="2">2 ⭐</option>
            <option value="1">1 ⭐</option>
          </select>
          <input
            type="text"
            name="comment"
            placeholder="Review comment..."
            value={localComment}
            onChange={(e) => setLocalComment(e.target.value)}
            required
            className="col-span-2 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
          >
            Add Review
          </button>
        </div>
      </form>
    </div>
  );
});

export default ReviewForm;