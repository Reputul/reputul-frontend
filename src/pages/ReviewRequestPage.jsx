import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS, buildUrl } from "../config/api";
import { useAuth } from "../context/AuthContext";
import { useBusiness } from "../context/BusinessContext";

const ReviewRequestsPage = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const { token } = useAuth();
  const { selectedBusiness } = useBusiness();
  const [reviewRequests, setReviewRequests] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("EMAIL");
  const [showSendModal, setShowSendModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  // NEW: Tab state for modal (customers vs quick send)
  const [sendModalTab, setSendModalTab] = useState("customers"); // 'customers' or 'quick'

  // NEW: Quick send form state - includes required fields for customer creation
  const [quickSendData, setQuickSendData] = useState({
    name: "",
    email: "",
    phone: "",
    serviceType: "General Service",
    saveAsCustomer: true,
  });

  useEffect(() => {
    if (selectedBusiness) {
      fetchCustomers();
      fetchTemplates();
      fetchReviewRequests();
      fetchStats();
    }
  }, [selectedBusiness]);

  const fetchCustomers = async () => {
    if (!selectedBusiness) return;

    setCustomersLoading(true);
    try {
      const response = await axios.get(
        buildUrl(API_ENDPOINTS.CUSTOMERS.BY_BUSINESS(selectedBusiness.id)),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCustomers(response.data);
    } catch (err) {
      setError("Failed to fetch customers");
      console.error("Error fetching customers:", err);
    } finally {
      setCustomersLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        buildUrl(API_ENDPOINTS.EMAIL_TEMPLATES.LIST),
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTemplates(response.data);
    } catch (err) {
      setError("Failed to fetch templates");
      console.error("Error fetching templates:", err);
    }
  };

  const fetchReviewRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        buildUrl(API_ENDPOINTS.REVIEW_REQUESTS.SEND),
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setReviewRequests(response.data);
    } catch (err) {
      console.error("Error fetching review requests:", err);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        buildUrl(API_ENDPOINTS.REVIEW_REQUESTS.STATS),
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStats(response.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const handleSendReviewRequest = async (customerId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        buildUrl(API_ENDPOINTS.REVIEW_REQUESTS.SEND),
        {
          customerId,
          deliveryMethod,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Review request sent:", response.data);
      return response.data;
    } catch (err) {
      console.error("Error sending review request:", err);
      throw err;
    }
  };

  const handleQuickSend = async () => {
    if (!selectedBusiness) {
      setError("No business selected");
      return;
    }
    // Validate required fields
    if (!quickSendData.name.trim()) {
      setError("Please enter the customer name");
      return;
    }

    if (deliveryMethod === "EMAIL" && !quickSendData.email.trim()) {
      setError("Please enter an email address for email delivery");
      return;
    }

    if (deliveryMethod === "SMS" && !quickSendData.phone.trim()) {
      setError("Please enter a phone number for SMS delivery");
      return;
    }

    // If saving as customer, validate required fields
    if (quickSendData.saveAsCustomer) {
      if (!quickSendData.businessId) {
        setError("Please select a business to associate this customer with");
        return;
      }
      if (!quickSendData.email.trim()) {
        setError("Email is required when saving as a customer");
        return;
      }
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");

      let customerId = null;

      // If save as customer is checked, create the customer first (or find existing)
      if (quickSendData.saveAsCustomer) {
        const customerPayload = {
          name: quickSendData.name,
          email: quickSendData.email,
          phone: quickSendData.phone || null,
          businessId: selectedBusiness.id,
          serviceType: quickSendData.serviceType || "General Service",
          serviceDate: new Date().toISOString().split("T")[0], // Today's date as YYYY-MM-DD
        };

        console.log("Creating customer with payload:", customerPayload);

        try {
          const customerResponse = await axios.post(
            buildUrl(API_ENDPOINTS.CUSTOMERS.LIST),
            customerPayload,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          customerId = customerResponse.data.id;
          console.log("Customer created successfully:", customerResponse.data);
        } catch (customerErr) {
          console.error("Customer creation error:", customerErr.response?.data);

          // If customer already exists, try to find them by email
          if (
            customerErr.response?.data?.error?.includes("email already exists")
          ) {
            console.log("Customer exists, searching for existing customer...");
            try {
              const searchResponse = await axios.get(
                buildUrl(
                  API_ENDPOINTS.CUSTOMERS.SEARCH || "/api/v1/customers/search"
                ) + `?q=${encodeURIComponent(quickSendData.email)}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );

              const existingCustomer = searchResponse.data.find(
                (c) =>
                  c.email?.toLowerCase() === quickSendData.email.toLowerCase()
              );

              if (existingCustomer) {
                customerId = existingCustomer.id;
                console.log("Found existing customer:", existingCustomer);
                setSuccess("Using existing customer record.");
              } else {
                throw new Error(
                  "Customer exists but could not be found. Please try again."
                );
              }
            } catch (searchErr) {
              console.error("Error searching for customer:", searchErr);
              throw new Error(
                "Customer with this email already exists. Please use the Customer List tab to select them."
              );
            }
          } else {
            throw new Error(
              customerErr.response?.data?.message ||
                customerErr.response?.data?.error ||
                "Failed to create customer. Check backend logs for details."
            );
          }
        }
      }

      // Send the review request
      const response = await axios.post(
        buildUrl(
          API_ENDPOINTS.REVIEW_REQUESTS.SEND_DIRECT ||
            "/api/v1/review-requests/send-direct"
        ),
        {
          customerName: quickSendData.name,
          customerEmail: quickSendData.email || null,
          customerPhone: quickSendData.phone || null,
          customerId: customerId,
          businessId: selectedBusiness.id,
          deliveryMethod,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(
        `✅ Review request sent to ${
          quickSendData.name
        } via ${deliveryMethod.toLowerCase()}!`
      );

      // Refresh data
      fetchReviewRequests();
      fetchStats();
      if (quickSendData.saveAsCustomer) {
        fetchCustomers();
      }

      // Reset form (keep businessId for convenience)
      setQuickSendData((prev) => ({
        name: "",
        email: "",
        phone: "",
        serviceType: "General Service",
        saveAsCustomer: true,
      }));
      setShowSendModal(false);
    } catch (err) {
      console.error("Error sending quick review request:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to send review request";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSendToSelected = async () => {
    if (selectedCustomers.length === 0) {
      setError("Please select customers");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const results = [];

      for (const customerId of selectedCustomers) {
        const result = await handleSendReviewRequest(customerId);
        results.push(result);
      }

      const successCount = results.filter((r) => r.status === "SENT").length;
      const failCount = results.length - successCount;

      setSuccess(
        `✅ ${successCount} ${deliveryMethod.toLowerCase()} review requests sent successfully! ${
          failCount > 0 ? `(${failCount} failed)` : ""
        }`
      );

      // Refresh data
      fetchReviewRequests();
      fetchStats();

      // Reset form
      setSelectedCustomers([]);
      setShowSendModal(false);
    } catch (err) {
      setError(
        `Failed to send ${deliveryMethod.toLowerCase()} review requests`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerSelect = (customerId) => {
    setSelectedCustomers((prev) =>
      prev.includes(customerId)
        ? prev.filter((id) => id !== customerId)
        : [...prev, customerId]
    );
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-800",
      SENT: "bg-green-100 text-green-800",
      DELIVERED: "bg-blue-100 text-blue-800",
      OPENED: "bg-purple-100 text-purple-800",
      CLICKED: "bg-indigo-100 text-indigo-800",
      COMPLETED: "bg-emerald-100 text-emerald-800",
      FAILED: "bg-red-100 text-red-800",
      BOUNCED: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status) => {
    const icons = {
      PENDING: "⏳",
      SENT: "📧",
      DELIVERED: "✅",
      OPENED: "👀",
      CLICKED: "🔗",
      COMPLETED: "⭐",
      FAILED: "❌",
      BOUNCED: "↩️",
    };
    return icons[status] || "📧";
  };

  const getDeliveryMethodIcon = (method) => {
    return method === "SMS" ? "📱" : "📧";
  };

  const generateFeedbackGateUrl = (customerId) => {
    return `${window.location.origin}/feedback-gate/${customerId}`;
  };

  const filteredRequests = reviewRequests.filter(
    (request) => filterStatus === "ALL" || request.status === filterStatus
  );

  // NEW: Open modal with appropriate tab based on customer count
  const handleOpenSendModal = () => {
    if (customers.length === 0) {
      setSendModalTab("quick");
    } else {
      setSendModalTab("customers");
    }
    setShowSendModal(true);
  };

  if (!selectedBusiness) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-gray-400 text-5xl mb-4">🏢</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Business Selected
          </h3>
          <p className="text-gray-600">
            Please select a business from the dropdown to manage review
            requests.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Review Requests</h1>
        <p className="text-gray-600">
          Send personalized review requests to your customers via email or SMS
          for{" "}
          <span className="font-semibold text-gray-900">
            {selectedBusiness.name}
          </span>
        </p>

        {/* Google Compliance Notice */}
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-green-600 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6.938-4.697a3.42 3.42 0 01-.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 01.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138 3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138z"
              />
            </svg>
            <span className="text-green-800 font-medium">
              Google Compliant System Active
            </span>
          </div>
          <p className="text-green-700 text-sm mt-1">
            ✅ All emails include ALL review platform options for ALL customers
            <br />
            ✅ Smart feedback gate routes customers based on initial rating
            <br />✅ 1-3 star ratings → Private feedback • 4-5 star ratings →
            Public platforms
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <span className="text-2xl">📧</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {stats.emailRequests || 0}
              </h3>
              <p className="text-sm text-gray-600">Email Requests</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <span className="text-2xl">📱</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {stats.smsRequests || 0}
              </h3>
              <p className="text-sm text-gray-600">SMS Requests</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <span className="text-2xl">👀</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {stats.openRate || 0}%
              </h3>
              <p className="text-sm text-gray-600">Open Rate</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-3 bg-indigo-100 rounded-full">
              <span className="text-2xl">🔗</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {stats.clickRate || 0}%
              </h3>
              <p className="text-sm text-gray-600">Click Rate</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <span className="text-2xl">⭐</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {stats.completionRate || 0}%
              </h3>
              <p className="text-sm text-gray-600">Review Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={handleOpenSendModal}
          className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
        >
          <span>🚀</span>
          Send Review Requests
        </button>

        <button
          onClick={() => setShowHistoryModal(true)}
          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
        >
          <span>📋</span>
          View History
        </button>

        <button
          onClick={() => navigate("/settings")}
          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
          </svg>
          Platform Setup
        </button>
      </div>

      {/* Recent Review Requests */}
      <div className="bg-white rounded-lg shadow border">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Requests
            </h2>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            >
              <option value="ALL">All Status</option>
              <option value="SENT">Sent</option>
              <option value="OPENED">Opened</option>
              <option value="CLICKED">Clicked</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Template
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Sent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <span className="text-4xl mb-4 block">📭</span>
                      <p className="text-lg font-medium">
                        No review requests yet
                      </p>
                      <p className="text-sm mt-1">
                        Send your first review request to get started!
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRequests.slice(0, 10).map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {request.customerName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.deliveryMethod === "SMS"
                            ? request.customerPhone
                            : request.customerEmail}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="mr-1">
                          {getDeliveryMethodIcon(request.deliveryMethod)}
                        </span>
                        <span className="text-sm text-gray-900">
                          {request.deliveryMethod || "EMAIL"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {request.templateName}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          request.status
                        )}`}
                      >
                        <span className="mr-1">
                          {getStatusIcon(request.status)}
                        </span>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {request.sentAt
                        ? new Date(request.sentAt).toLocaleDateString()
                        : "Not sent"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            navigator.clipboard.writeText(
                              generateFeedbackGateUrl(request.customerId)
                            )
                          }
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                          title="Copy Google-compliant feedback gate link"
                        >
                          📋 Gate Link
                        </button>
                        {request.reviewLink && (
                          <button
                            onClick={() =>
                              window.open(request.reviewLink, "_blank")
                            }
                            className="text-green-600 hover:text-green-900 text-sm font-medium"
                            title="View original review link"
                          >
                            🔗 Direct
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================ */}
      {/* Send Modal - With Tabs for Customer List vs Quick Send */}
      {/* ============================================================ */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Send Review Requests</h2>
              <button
                onClick={() => setShowSendModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                onClick={() => setSendModalTab("quick")}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  sendModalTab === "quick"
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                ⚡ Quick Send
                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                  Fast
                </span>
              </button>
              <button
                onClick={() => setSendModalTab("customers")}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  sendModalTab === "customers"
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                👥 From Customer List
                {customers.length > 0 && (
                  <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {customers.length}
                  </span>
                )}
              </button>
            </div>

            {/* Delivery Method Selection - Shared across tabs */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                Choose Delivery Method
              </h3>
              <div className="flex space-x-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="EMAIL"
                    checked={deliveryMethod === "EMAIL"}
                    onChange={(e) => setDeliveryMethod(e.target.value)}
                    className="mr-2"
                  />
                  <span className="flex items-center">
                    📧 Email (Google-compliant templates)
                  </span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="SMS"
                    checked={deliveryMethod === "SMS"}
                    onChange={(e) => setDeliveryMethod(e.target.value)}
                    className="mr-2"
                  />
                  <span className="flex items-center">
                    📱 SMS (Short feedback gate link)
                  </span>
                </label>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {deliveryMethod === "EMAIL"
                  ? "📧 Emails include all review platforms and route via feedback gate"
                  : "📱 SMS sends short link to Google-compliant feedback gate"}
              </p>
            </div>

            {/* ============================================================ */}
            {/* Quick Send Tab Content */}
            {/* ============================================================ */}
            {sendModalTab === "quick" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quick Send Form */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Customer Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Customer Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={quickSendData.name}
                        onChange={(e) =>
                          setQuickSendData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="John Smith"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address{" "}
                        {(deliveryMethod === "EMAIL" ||
                          quickSendData.saveAsCustomer) && (
                          <span className="text-red-500">*</span>
                        )}
                      </label>
                      <input
                        type="email"
                        value={quickSendData.email}
                        onChange={(e) =>
                          setQuickSendData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        placeholder="john@example.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                      {quickSendData.saveAsCustomer &&
                        deliveryMethod === "SMS" && (
                          <p className="text-xs text-gray-500 mt-1">
                            Email is required when saving as a customer
                          </p>
                        )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number{" "}
                        {deliveryMethod === "SMS" && (
                          <span className="text-red-500">*</span>
                        )}
                      </label>
                      <input
                        type="tel"
                        value={quickSendData.phone}
                        onChange={(e) =>
                          setQuickSendData((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        placeholder="+1 (555) 123-4567"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    {/* Save as Customer Options */}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-center mb-3">
                        <input
                          type="checkbox"
                          id="saveAsCustomer"
                          checked={quickSendData.saveAsCustomer}
                          onChange={(e) =>
                            setQuickSendData((prev) => ({
                              ...prev,
                              saveAsCustomer: e.target.checked,
                            }))
                          }
                          className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor="saveAsCustomer"
                          className="text-sm font-medium text-gray-700"
                        >
                          Save as a customer for future requests
                        </label>
                      </div>

                      {/* Show additional fields when saving as customer */}
                      {quickSendData.saveAsCustomer && (
                        <div className="space-y-3 pl-6 border-l-2 border-primary-200">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Service Type
                            </label>
                            <input
                              type="text"
                              value={quickSendData.serviceType}
                              onChange={(e) =>
                                setQuickSendData((prev) => ({
                                  ...prev,
                                  serviceType: e.target.value,
                                }))
                              }
                              placeholder="e.g., Roof Repair, HVAC Install"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                          </div>

                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-xs text-blue-800">
                              Customer will be associated with{" "}
                              <span className="font-semibold">
                                {selectedBusiness.name}
                              </span>
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleQuickSend}
                    disabled={loading || !quickSendData.name.trim()}
                    className="mt-6 w-full px-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 font-semibold flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <span>🚀</span>
                        Send {deliveryMethod} Now
                      </>
                    )}
                  </button>
                </div>

                {/* Info Panel */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    ⚡ Quick Send
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Send a one-off review request without navigating to the
                    customers page first. Perfect for quick follow-ups!
                  </p>

                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      <span>Fast - just enter name and contact</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      <span>Optionally save as customer for follow-ups</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      <span>Same Google-compliant feedback gate</span>
                    </div>
                  </div>

                  <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 text-sm">
                      💡 Pro Tip
                    </h4>
                    <p className="text-xs text-blue-800 mt-1">
                      Keep "Save as customer" checked to build your customer
                      database and enable follow-up campaigns later.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* Customer List Tab Content */}
            {/* ============================================================ */}
            {sendModalTab === "customers" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Customer Selection */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Select Customers
                  </h3>

                  {customersLoading ? (
                    <div className="border border-gray-300 rounded-lg p-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-2"></div>
                      <p className="text-gray-500">Loading customers...</p>
                    </div>
                  ) : customers.length === 0 ? (
                    /* Empty State - No Customers */
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        No customers yet
                      </h4>
                      <p className="text-gray-600 text-sm mb-4">
                        Add customers to send bulk review requests and track
                        engagement over time.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2 justify-center">
                        <button
                          onClick={() => {
                            setShowSendModal(false);
                            navigate("/customers");
                          }}
                          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 font-medium text-sm flex items-center justify-center gap-2"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                          Add Customers
                        </button>
                        <button
                          onClick={() => {
                            setShowSendModal(false);
                            navigate("/contacts");
                          }}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm flex items-center justify-center gap-2"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                            />
                          </svg>
                          Import Contacts
                        </button>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          Or use the{" "}
                          <button
                            onClick={() => setSendModalTab("quick")}
                            className="text-primary-600 hover:underline font-medium"
                          >
                            Quick Send
                          </button>{" "}
                          tab to send without adding a customer.
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* Customer List */
                    <>
                      <div className="border border-gray-300 rounded-lg max-h-80 overflow-y-auto">
                        {customers.map((customer) => {
                          const hasEmail =
                            customer.email && customer.email.trim();
                          const hasPhone =
                            customer.phone && customer.phone.trim();
                          const canSend =
                            deliveryMethod === "EMAIL" ? hasEmail : hasPhone;

                          return (
                            <div
                              key={customer.id}
                              className={`p-3 border-b border-gray-200 last:border-b-0 ${
                                !canSend ? "opacity-50" : ""
                              }`}
                            >
                              <label className="flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selectedCustomers.includes(
                                    customer.id
                                  )}
                                  onChange={() =>
                                    handleCustomerSelect(customer.id)
                                  }
                                  disabled={!canSend}
                                  className="mr-3"
                                />
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {customer.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {deliveryMethod === "EMAIL"
                                      ? customer.email
                                      : customer.phone}
                                    {!canSend && (
                                      <span className="text-red-500 ml-2">
                                        (
                                        {deliveryMethod === "EMAIL"
                                          ? "No email"
                                          : "No phone"}
                                        )
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {customer.serviceType}
                                  </div>
                                </div>
                              </label>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        {selectedCustomers.length} customer(s) selected for{" "}
                        {deliveryMethod.toLowerCase()}
                      </div>
                    </>
                  )}
                </div>

                {/* Information Panel */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    ✅ Google Compliance Features
                  </h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      <span>All customers see all review platform options</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      <span>Smart routing: 1-3 stars → private feedback</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      <span>4-5 stars → encouraged to public platforms</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      <span>No filtering or manipulation of reviews</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      <span>Honest messaging that doesn't mislead</span>
                    </div>
                  </div>

                  {deliveryMethod === "EMAIL" && (
                    <div className="mt-4 bg-blue-50 rounded p-3">
                      <h4 className="font-medium text-blue-900">
                        📧 Email Template
                      </h4>
                      <p className="text-xs text-blue-800 mt-1">
                        Uses Google-compliant HTML templates with buttons for
                        Google, Facebook, Yelp, and private feedback.
                      </p>
                    </div>
                  )}

                  {deliveryMethod === "SMS" && (
                    <div className="mt-4 bg-green-50 rounded p-3">
                      <h4 className="font-medium text-green-900">
                        📱 SMS Message
                      </h4>
                      <p className="text-xs text-green-800 mt-1">
                        Sends short, friendly message with link to feedback gate
                        for rating selection.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Footer Actions for Customer List Tab */}
            {sendModalTab === "customers" && customers.length > 0 && (
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowSendModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendToSelected}
                  disabled={loading || selectedCustomers.length === 0}
                  className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 disabled:opacity-50 font-medium"
                >
                  {loading
                    ? "Sending..."
                    : `Send ${deliveryMethod} to ${selectedCustomers.length} Customer(s)`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Review Request History</h2>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Method
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Template
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Sent
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Opened
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Clicked
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Links
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td
                        colSpan="8"
                        className="px-4 py-12 text-center text-gray-500"
                      >
                        No review requests found
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium text-gray-900">
                              {request.customerName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {request.deliveryMethod === "SMS"
                                ? request.customerPhone
                                : request.customerEmail}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <span className="mr-1">
                              {getDeliveryMethodIcon(request.deliveryMethod)}
                            </span>
                            <span className="text-sm">
                              {request.deliveryMethod || "EMAIL"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {request.templateName}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              request.status
                            )}`}
                          >
                            {getStatusIcon(request.status)} {request.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {request.sentAt
                            ? new Date(request.sentAt).toLocaleString()
                            : "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {request.openedAt
                            ? new Date(request.openedAt).toLocaleString()
                            : "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {request.clickedAt
                            ? new Date(request.clickedAt).toLocaleString()
                            : "-"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col space-y-1">
                            <button
                              onClick={() =>
                                navigator.clipboard.writeText(
                                  generateFeedbackGateUrl(request.customerId)
                                )
                              }
                              className="text-blue-600 hover:text-blue-900 text-xs font-medium text-left"
                              title="Copy Google-compliant feedback gate link"
                            >
                              📋 Gate Link
                            </button>
                            {request.reviewLink && (
                              <button
                                onClick={() =>
                                  navigator.clipboard.writeText(
                                    request.reviewLink
                                  )
                                }
                                className="text-green-600 hover:text-green-900 text-xs font-medium text-left"
                                title="Copy direct link"
                              >
                                🔗 Direct Link
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewRequestsPage;
