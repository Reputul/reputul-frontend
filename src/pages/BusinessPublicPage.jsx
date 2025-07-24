import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const BusinessPublicPage = () => {
  const { id } = useParams();
  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState({ rating: "", comment: "" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const bizRes = await axios.get(`http://localhost:8080/api/businesses/${id}`);
        const reviewRes = await axios.get(`http://localhost:8080/api/reviews/business/${id}`);
        setBusiness(bizRes.data);
        setReviews(reviewRes.data);
      } catch (err) {
        console.error("Error fetching business info:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleReviewChange = (e) => {
    setNewReview({ ...newReview, [e.target.name]: e.target.value });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!newReview.rating || !newReview.comment) return;
      await axios.post(`http://localhost:8080/api/reviews/public/${id}`, newReview);
      setNewReview({ rating: "", comment: "" });

      // Refresh reviews
      const reviewRes = await axios.get(`http://localhost:8080/api/reviews/business/${id}`);
      setReviews(reviewRes.data);
    } catch (err) {
      console.error("Error submitting review:", err);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!business) return <p>Business not found.</p>;

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h1>{business.name}</h1>
      <p>🏷️ Industry: {business.industry}</p>
      <p>🌐 Website: <a href={business.website} target="_blank" rel="noreferrer">{business.website}</a></p>
      <p>📍 Address: {business.address}</p>
      <p>📞 Phone: {business.phone}</p>
      <p>⭐ Reputation Score: {business.reputationScore.toFixed(1)}</p>
      <p>🏅 Badge: {business.badge}</p>

      <hr style={{ margin: "2rem 0" }} />

      <h3>Customer Reviews</h3>
      {reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        <ul style={{ paddingLeft: "1rem" }}>
          {reviews.map((review) => (
            <li key={review.id} style={{ marginBottom: "1rem" }}>
              <strong>⭐ {review.rating}</strong><br />
              {review.comment}
            </li>
          ))}
        </ul>
      )}

      <hr style={{ margin: "2rem 0" }} />

      <h3>Leave a Review</h3>
      <form onSubmit={handleReviewSubmit}>
        <div>
          <input
            type="number"
            name="rating"
            min="1"
            max="5"
            placeholder="Rating (1-5)"
            value={newReview.rating}
            onChange={handleReviewChange}
            required
            style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
          />
        </div>
        <div>
          <textarea
            name="comment"
            placeholder="Your comment"
            value={newReview.comment}
            onChange={handleReviewChange}
            required
            style={{ width: "100%", padding: "0.5rem", height: "100px" }}
          />
        </div>
        <button type="submit" style={{ marginTop: "0.5rem", padding: "0.5rem 1rem" }}>
          Submit Review
        </button>
      </form>
    </div>
  );
};

export default BusinessPublicPage;
