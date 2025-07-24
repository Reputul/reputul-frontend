import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const DashboardPage = () => {
  const { token } = useAuth();
  const [businesses, setBusinesses] = useState([]);
  const [reviewsMap, setReviewsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [newBusiness, setNewBusiness] = useState({
    name: "",
    industry: "",
    phone: "",
    website: "",
    address: "",
  });
  const [newReviews, setNewReviews] = useState({});
  const [filterMap, setFilterMap] = useState({});
  const [sortMap, setSortMap] = useState({});
  const [reviewSummaries, setReviewSummaries] = useState({});

  const fetchBusinesses = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBusinesses(res.data);

      const summaries = {};
      await Promise.all(
        res.data.map(async (biz) => {
          const summaryRes = await axios.get(
            `http://localhost:8080/api/businesses/${biz.id}/review-summary`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          summaries[biz.id] = summaryRes.data;
        })
      );
      setReviewSummaries(summaries);

      const reviewsData = {};
      await Promise.all(
        res.data.map(async (biz) => {
          const reviewRes = await axios.get(
            `http://localhost:8080/api/reviews/business/${biz.id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          reviewsData[biz.id] = reviewRes.data;
        })
      );
      setReviewsMap(reviewsData);
    } catch (err) {
      console.error("Error fetching businesses or reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, [token]);

  const handleBusinessChange = (e) => {
    setNewBusiness({ ...newBusiness, [e.target.name]: e.target.value });
  };

  const handleCreateBusiness = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8080/api/businesses", newBusiness, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNewBusiness({
        name: "",
        industry: "",
        phone: "",
        website: "",
        address: "",
      });
      fetchBusinesses();
    } catch (err) {
      console.error("Error creating business:", err);
    }
  };

  const handleReviewChange = (e, businessId) => {
    setNewReviews({
      ...newReviews,
      [businessId]: {
        ...newReviews[businessId],
        [e.target.name]: e.target.value,
      },
    });
  };

  const handleCreateReview = async (e, businessId) => {
    e.preventDefault();
    try {
      const reviewData = newReviews[businessId];
      if (!reviewData || !reviewData.rating || !reviewData.comment) return;

      await axios.post(
        `http://localhost:8080/api/reviews/${businessId}`,
        reviewData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNewReviews((prev) => ({
        ...prev,
        [businessId]: { rating: "", comment: "" },
      }));

      fetchBusinesses();

      const reviewRes = await axios.get(
        `http://localhost:8080/api/reviews/business/${businessId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setReviewsMap((prev) => ({
        ...prev,
        [businessId]: reviewRes.data,
      }));
    } catch (err) {
      console.error("Error submitting review:", err);
    }
  };

  const applyFiltersAndSort = (reviews, filter, sort) => {
    let filtered = reviews;
    if (filter) {
      filtered = filtered.filter((r) => r.rating >= filter);
    }
    switch (sort) {
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "highest":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "lowest":
        filtered.sort((a, b) => a.rating - b.rating);
        break;
      default:
        break;
    }
    return filtered;
  };

  const handleFilterChange = (businessId, value) => {
    setFilterMap((prev) => ({ ...prev, [businessId]: parseInt(value) || "" }));
  };

  const handleSortChange = (businessId, value) => {
    setSortMap((prev) => ({ ...prev, [businessId]: value }));
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Your Businesses</h2>
      {loading ? (
        <p>Loading...</p>
      ) : businesses.length === 0 ? (
        <p>No businesses found.</p>
      ) : (
        <ul>
          {businesses.map((biz) => (
            <li key={biz.id} style={{ marginBottom: "3rem" }}>
              <strong>{biz.name}</strong> <br />
              Industry: {biz.industry} <br />
              Phone: {biz.phone} <br />
              Website: <a href={biz.website}>{biz.website}</a> <br />
              Address: {biz.address} <br />
              Reputation Score: {biz.reputationScore} <br />
              Badge: {biz.badge || "None"} <br />
              Reviews: {biz.reviewCount}
              {reviewSummaries[biz.id] && (
                <div style={{ marginTop: "0.5rem" }}>
                  <div>
                    ⭐ Average Rating:{" "}
                    {reviewSummaries[biz.id].averageRating.toFixed(1)}
                  </div>
                  <div>
                    🧮 Total Reviews: {reviewSummaries[biz.id].totalReviews}
                  </div>
                  <div>
                    💬 Latest Comment:{" "}
                    {reviewSummaries[biz.id].mostRecentComment}
                  </div>
                  <div>
                    🏅 Dynamic Badge: {reviewSummaries[biz.id].badge}
                  </div>
                </div>
              )}
              {reviewsMap[biz.id] && reviewsMap[biz.id].length > 0 && (
                <div style={{ marginTop: "1rem" }}>
                  <h4>Reviews:</h4>

                  <label>Filter by rating:</label>
                  <select
                    value={filterMap[biz.id] || ""}
                    onChange={(e) => handleFilterChange(biz.id, e.target.value)}
                  >
                    <option value="">All</option>
                    <option value="5">5★ only</option>
                    <option value="4">4★ and up</option>
                    <option value="3">3★ and up</option>
                  </select>

                  <label style={{ marginLeft: "1rem" }}>Sort by:</label>
                  <select
                    value={sortMap[biz.id] || ""}
                    onChange={(e) => handleSortChange(biz.id, e.target.value)}
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="highest">Highest rating</option>
                    <option value="lowest">Lowest rating</option>
                  </select>

                  <ul style={{ marginTop: "1rem" }}>
                    {applyFiltersAndSort(
                      reviewsMap[biz.id],
                      filterMap[biz.id],
                      sortMap[biz.id]
                    ).map((review) => (
                      <li key={review.id}>
                        ⭐ {review.rating} — {review.comment}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <form onSubmit={(e) => handleCreateReview(e, biz.id)}>
                <h5>Add Review:</h5>
                <input
                  type="number"
                  name="rating"
                  placeholder="Rating (1-5)"
                  min="1"
                  max="5"
                  value={newReviews[biz.id]?.rating || ""}
                  onChange={(e) => handleReviewChange(e, biz.id)}
                  required
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    marginBottom: "0.5rem",
                  }}
                />
                <textarea
                  name="comment"
                  placeholder="Comment"
                  value={newReviews[biz.id]?.comment || ""}
                  onChange={(e) => handleReviewChange(e, biz.id)}
                  required
                  style={{ width: "100%", padding: "0.5rem" }}
                />
                <button
                  type="submit"
                  style={{ marginTop: "0.5rem", padding: "0.5rem 1rem" }}
                >
                  Submit Review
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <hr style={{ margin: "2rem 0" }} />

      <h3>Create New Business</h3>
      <form onSubmit={handleCreateBusiness} style={{ maxWidth: "400px" }}>
        <div>
          <label>Name:</label>
          <br />
          <input
            type="text"
            name="name"
            value={newBusiness.name}
            onChange={handleBusinessChange}
            required
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>
        <div>
          <label>Industry:</label>
          <br />
          <input
            type="text"
            name="industry"
            value={newBusiness.industry}
            onChange={handleBusinessChange}
            required
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>
        <div>
          <label>Phone:</label>
          <br />
          <input
            type="text"
            name="phone"
            value={newBusiness.phone}
            onChange={handleBusinessChange}
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>
        <div>
          <label>Website:</label>
          <br />
          <input
            type="url"
            name="website"
            value={newBusiness.website}
            onChange={handleBusinessChange}
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>
        <div>
          <label>Address:</label>
          <br />
          <input
            type="text"
            name="address"
            value={newBusiness.address}
            onChange={handleBusinessChange}
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>
        <button
          type="submit"
          style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}
        >
          Add Business
        </button>
      </form>
    </div>
  );
};

export default DashboardPage;
