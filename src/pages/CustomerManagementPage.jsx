import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const CustomerManagementPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState("all");
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showEditCustomer, setShowEditCustomer] = useState(null);
  const [showCustomerDetails, setShowCustomerDetails] = useState(null);
  const [showReviewRequestModal, setShowReviewRequestModal] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [sendingReview, setSendingReview] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  
  // NEW: SMS delivery state
  const [deliveryMethod, setDeliveryMethod] = useState("EMAIL");
  const [phoneValidation, setPhoneValidation] = useState({ valid: true, message: "" });

  const [newCustomer, setNewCustomer] = useState({
    businessId: "",
    name: "",
    email: "",
    phone: "",
    serviceDate: "",
    serviceType: "",
    status: "COMPLETED",
    tags: [],
    notes: "",
  });

  const [editCustomer, setEditCustomer] = useState({
    id: "",
    businessId: "",
    name: "",
    email: "",
    phone: "",
    serviceDate: "",
    serviceType: "",
    status: "COMPLETED",
    tags: [],
    notes: "",
  });

  // Fetch businesses, customers, and templates
  const fetchData = useCallback(async () => {
    try {
      const [businessRes, customerRes, templateRes] = await Promise.all([
        axios.get("http://localhost:8080/api/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:8080/api/customers", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:8080/api/email-templates", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setBusinesses(businessRes.data);
      setCustomers(customerRes.data);
      setTemplates(templateRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      alert("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // NEW: Validate phone number when delivery method changes
  const validatePhoneNumber = useCallback(async (phone) => {
    if (!phone || deliveryMethod !== "SMS") {
      setPhoneValidation({ valid: true, message: "" });
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8080/api/review-requests/validate-phone",
        { phone },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPhoneValidation({
        valid: response.data.valid,
        message: response.data.message
      });
    } catch (err) {
      setPhoneValidation({
        valid: false,
        message: "Error validating phone number"
      });
    }
  }, [deliveryMethod, token]);

  const handleAddCustomer = useCallback(async () => {
    if (
      !newCustomer.businessId ||
      !newCustomer.name ||
      !newCustomer.email ||
      !newCustomer.serviceDate ||
      !newCustomer.serviceType
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      await axios.post(
        "http://localhost:8080/api/customers",
        {
          ...newCustomer,
          businessId: parseInt(newCustomer.businessId),
          tags:
            newCustomer.tags.length > 0 ? newCustomer.tags : ["NEW_CUSTOMER"],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setNewCustomer({
        businessId: "",
        name: "",
        email: "",
        phone: "",
        serviceDate: "",
        serviceType: "",
        status: "COMPLETED",
        tags: [],
        notes: "",
      });
      setShowAddCustomer(false);
      alert("Customer added successfully!");
      fetchData();
    } catch (err) {
      console.error("Error adding customer:", err);
      alert("Failed to add customer");
    }
  }, [newCustomer, token, fetchData]);

  const handleUpdateCustomer = useCallback(async () => {
    if (
      !editCustomer.name ||
      !editCustomer.email ||
      !editCustomer.serviceDate ||
      !editCustomer.serviceType
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      await axios.put(
        `http://localhost:8080/api/customers/${editCustomer.id}`,
        {
          ...editCustomer,
          businessId: parseInt(editCustomer.businessId),
          tags:
            editCustomer.tags.length > 0 ? editCustomer.tags : ["NEW_CUSTOMER"],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setShowEditCustomer(null);
      alert("Customer updated successfully!");
      fetchData();
    } catch (err) {
      console.error("Error updating customer:", err);
      alert("Failed to update customer");
    }
  }, [editCustomer, token, fetchData]);

  const handleDeleteCustomer = useCallback(
    async (customerId) => {
      if (
        !window.confirm(
          "Are you sure you want to delete this customer? This action cannot be undone."
        )
      ) {
        return;
      }

      try {
        await axios.delete(
          `http://localhost:8080/api/customers/${customerId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        alert("Customer deleted successfully!");
        fetchData();
      } catch (err) {
        console.error("Error deleting customer:", err);
        alert("Failed to delete customer");
      }
    },
    [token, fetchData]
  );

  // UPDATED: Handle both email and SMS delivery
  const handleSendReviewRequest = useCallback(
    async (customer) => {
      // Validate delivery method requirements
      if (deliveryMethod === "SMS") {
        if (!customer.phone) {
          alert("Customer phone number is required for SMS delivery");
          return;
        }
        if (!phoneValidation.valid) {
          alert("Please enter a valid phone number for SMS delivery");
          return;
        }
      }

      setSendingReview(true);

      try {
        const requestData = {
          customerId: customer.id,
          deliveryMethod: deliveryMethod
        };

        // Add template ID for email delivery (SMS uses built-in templates)
        if (deliveryMethod === "EMAIL" && selectedTemplate) {
          requestData.templateId = parseInt(selectedTemplate);
        }

        const response = await axios.post(
          "http://localhost:8080/api/review-requests",
          requestData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.status === "SENT") {
          const method = response.data.deliveryMethod || deliveryMethod;
          const recipient = response.data.recipient || 
                           (method === "SMS" ? customer.phone : customer.email);
          alert(`✅ ${method} review request sent successfully to ${customer.name} (${recipient})!`);
        } else {
          alert(
            `❌ Failed to send review request: ${
              response.data.errorMessage || "Unknown error"
            }`
          );
        }

        setShowReviewRequestModal(null);
        setSelectedTemplate("");
        setDeliveryMethod("EMAIL");
      } catch (err) {
        console.error("Error sending review request:", err);
        alert("Failed to send review request");
      } finally {
        setSendingReview(false);
      }
    },
    [deliveryMethod, phoneValidation.valid, selectedTemplate, token]
  );

  const handleCustomerChange = useCallback((e) => {
    const { name, value } = e.target;
    setNewCustomer((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleEditCustomerChange = useCallback((e) => {
    const { name, value } = e.target;
    setEditCustomer((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleTagToggle = useCallback((tag, isEdit = false) => {
    if (isEdit) {
      setEditCustomer((prev) => ({
        ...prev,
        tags: prev.tags.includes(tag)
          ? prev.tags.filter((t) => t !== tag)
          : [...prev.tags, tag],
      }));
    } else {
      setNewCustomer((prev) => ({
        ...prev,
        tags: prev.tags.includes(tag)
          ? prev.tags.filter((t) => t !== tag)
          : [...prev.tags, tag],
      }));
    }
  }, []);

  const openEditModal = (customer) => {
    setEditCustomer({
      id: customer.id,
      businessId: customer.business.id.toString(),
      name: customer.name,
      email: customer.email,
      phone: customer.phone || "",
      serviceDate: customer.serviceDate,
      serviceType: customer.serviceType,
      status: customer.status,
      tags: customer.tags || [],
      notes: customer.notes || "",
    });
    setShowEditCustomer(customer);
  };

  // UPDATED: Reset delivery method when opening modal
  const openReviewRequestModal = (customer) => {
    setShowReviewRequestModal(customer);
    setSelectedTemplate("");
    setDeliveryMethod("EMAIL");
    setPhoneValidation({ valid: true, message: "" });
  };

  // NEW: Handle delivery method change and validate phone
  const handleDeliveryMethodChange = useCallback((method) => {
    setDeliveryMethod(method);
    if (method === "SMS" && showReviewRequestModal?.phone) {
      validatePhoneNumber(showReviewRequestModal.phone);
    }
  }, [showReviewRequestModal?.phone, validatePhoneNumber]);

  const filteredCustomers = customers.filter((customer) => {
    const businessMatch =
      selectedBusiness === "all" ||
      customer.business?.id.toString() === selectedBusiness;
    const searchMatch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.serviceType.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch =
      filterStatus === "all" || customer.status === filterStatus;

    return businessMatch && searchMatch && statusMatch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTagColor = (tag) => {
    switch (tag) {
      case "REPEAT_CUSTOMER":
        return "bg-blue-100 text-blue-800";
      case "NEW_CUSTOMER":
        return "bg-purple-100 text-purple-800";
      case "VIP":
        return "bg-yellow-100 text-yellow-800";
      case "REFERRAL":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const CustomerCard = ({ customer }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {customer.name}
            </h3>
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                customer.status
              )}`}
            >
              {customer.status.toLowerCase()}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">
            {customer.business?.name}
          </p>
          <p className="text-sm text-gray-500">{customer.serviceType}</p>
        </div>
        <button
          onClick={() => setShowCustomerDetails(customer)}
          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        </button>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          {customer.email}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
          {customer.phone || "No phone"}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0l-1 12a2 2 0 002 2h6a2 2 0 002-2L15 7"
            />
          </svg>
          Service Date: {customer.serviceDate}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {customer.tags &&
          customer.tags.map((tag) => (
            <span
              key={tag}
              className={`px-2 py-1 text-xs font-medium rounded-full ${getTagColor(
                tag
              )}`}
            >
              {tag.replace("_", " ").toLowerCase()}
            </span>
          ))}
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => openReviewRequestModal(customer)}
          className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Send Review Request
        </button>
        <button
          onClick={() => openEditModal(customer)}
          className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          Edit Customer
        </button>
      </div>
    </div>
  );

  const predefinedTags = ["REPEAT_CUSTOMER", "NEW_CUSTOMER", "VIP", "REFERRAL"];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Customer Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage customers and send targeted review requests via email or SMS
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/review-requests")}
                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl flex items-center space-x-2 hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg"
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
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
                <span>Review Requests</span>
              </button>
              <button
                onClick={() => setShowAddCustomer(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl flex items-center space-x-2 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg"
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <span>Add Customer</span>
              </button>
              <button
                onClick={() => navigate("/review-platform-setup")}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl flex items-center space-x-2 hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg"
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>Platform Setup</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Customers
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, email, or service..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg
                  className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business
              </label>
              <select
                value={selectedBusiness}
                onChange={(e) => setSelectedBusiness(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Businesses</option>
                {businesses.map((business) => (
                  <option key={business.id} value={business.id}>
                    {business.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="COMPLETED">Completed</option>
                <option value="PENDING">Pending</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div className="flex items-end">
              <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                Export Customers
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Customers
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {customers.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customers.filter((c) => c.status === "COMPLETED").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 4V4m0 2h10m0-2V4m-5 4v6m-3-3h6"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  With Phone Numbers
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {customers.filter((c) => c.phone && c.phone.trim()).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                <svg
                  className="w-6 h-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0l-1 12a2 2 0 002 2h6a2 2 0 002-2L15 7"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    customers.filter((c) => {
                      const currentMonth = new Date().getMonth();
                      const customerMonth = new Date(c.createdAt).getMonth();
                      return customerMonth === currentMonth;
                    }).length
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
            <CustomerCard key={customer.id} customer={customer} />
          ))}
        </div>

        {filteredCustomers.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No customers found
            </h3>
            <p className="text-gray-600 mb-6">
              No customers match your current search criteria.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedBusiness("all");
                setFilterStatus("all");
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* UPDATED: Review Request Modal with SMS Support */}
      {showReviewRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Send Review Request to {showReviewRequestModal.name}
            </h3>

            <div className="mb-6">
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-600">
                  <strong>Customer:</strong> {showReviewRequestModal.name} (
                  {showReviewRequestModal.email})
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Phone:</strong> {showReviewRequestModal.phone || "Not provided"}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Service:</strong> {showReviewRequestModal.serviceType}{" "}
                  on {showReviewRequestModal.serviceDate}
                </p>
              </div>

              {/* NEW: Delivery Method Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Method
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="deliveryMethod" 
                      value="EMAIL"
                      checked={deliveryMethod === 'EMAIL'}
                      onChange={(e) => handleDeliveryMethodChange(e.target.value)}
                      className="mr-2"
                    />
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Email
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="deliveryMethod" 
                      value="SMS"
                      checked={deliveryMethod === 'SMS'}
                      onChange={(e) => handleDeliveryMethodChange(e.target.value)}
                      disabled={!showReviewRequestModal.phone}
                      className="mr-2"
                    />
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10m0 0v10l-5-5-5 5V8z" />
                      </svg>
                      SMS
                    </span>
                  </label>
                </div>
                
                {/* Phone validation feedback */}
                {deliveryMethod === 'SMS' && (
                  <div className="mt-2">
                    {!showReviewRequestModal.phone ? (
                      <p className="text-sm text-red-600">⚠️ Customer phone number required for SMS delivery</p>
                    ) : !phoneValidation.valid ? (
                      <p className="text-sm text-red-600">⚠️ {phoneValidation.message}</p>
                    ) : (
                      <p className="text-sm text-green-600">✅ Valid phone number for SMS delivery</p>
                    )}
                  </div>
                )}
              </div>

              {/* Email Template Selection (only show for email delivery) */}
              {deliveryMethod === 'EMAIL' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Email Template
                  </label>
                  <div className="space-y-2">
                    {templates.map((template) => (
                      <label
                        key={template.id}
                        className="flex items-start cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <input
                          type="radio"
                          name="template"
                          value={template.id}
                          checked={selectedTemplate == template.id}
                          onChange={(e) => setSelectedTemplate(e.target.value)}
                          className="mt-1 mr-3"
                        />
                        <div>
                          <div className="font-medium text-gray-900">
                            {template.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {template.subject}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {template.typeDisplayName}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* SMS Preview (only show for SMS delivery) */}
              {deliveryMethod === 'SMS' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMS Message Preview
                  </label>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <p className="text-sm text-gray-700">
                      Hi {showReviewRequestModal.name.split(' ')[0]}! Thanks for choosing your business for your {showReviewRequestModal.serviceType}. 
                      Share your experience: [Review Link] Reply STOP to opt out.
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      📱 SMS messages are automatically optimized for mobile delivery
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowReviewRequestModal(null)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSendReviewRequest(showReviewRequestModal)}
                disabled={
                  sendingReview || 
                  (deliveryMethod === 'EMAIL' && !selectedTemplate) ||
                  (deliveryMethod === 'SMS' && (!showReviewRequestModal.phone || !phoneValidation.valid))
                }
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {sendingReview ? "Sending..." : `Send ${deliveryMethod} Review Request`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Add New Customer
            </h3>
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business *
                  </label>
                  <select
                    name="businessId"
                    value={newCustomer.businessId}
                    onChange={handleCustomerChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Business</option>
                    {businesses.map((business) => (
                      <option key={business.id} value={business.id}>
                        {business.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newCustomer.name}
                    onChange={handleCustomerChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={newCustomer.email}
                    onChange={handleCustomerChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone <span className="text-sm text-gray-500">(for SMS reviews)</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={newCustomer.phone}
                    onChange={handleCustomerChange}
                    placeholder="+1234567890"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Date *
                  </label>
                  <input
                    type="date"
                    name="serviceDate"
                    value={newCustomer.serviceDate}
                    onChange={handleCustomerChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Type *
                  </label>
                  <input
                    type="text"
                    name="serviceType"
                    value={newCustomer.serviceType}
                    onChange={handleCustomerChange}
                    placeholder="e.g., Kitchen Sink Repair, Oil Change, Haircut"
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={newCustomer.status}
                    onChange={handleCustomerChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="COMPLETED">Completed</option>
                    <option value="PENDING">Pending</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {predefinedTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleTagToggle(tag)}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                          newCustomer.tags.includes(tag)
                            ? "bg-blue-100 text-blue-800 border-2 border-blue-300"
                            : "bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200"
                        }`}
                      >
                        {tag.replace("_", " ").toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={newCustomer.notes}
                    onChange={handleCustomerChange}
                    rows={3}
                    placeholder="Any additional notes about this customer..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleAddCustomer}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Add Customer
                </button>
                <button
                  onClick={() => setShowAddCustomer(false)}
                  className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {showEditCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Edit Customer
            </h3>
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business *
                  </label>
                  <select
                    name="businessId"
                    value={editCustomer.businessId}
                    onChange={handleEditCustomerChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Business</option>
                    {businesses.map((business) => (
                      <option key={business.id} value={business.id}>
                        {business.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editCustomer.name}
                    onChange={handleEditCustomerChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={editCustomer.email}
                    onChange={handleEditCustomerChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone <span className="text-sm text-gray-500">(for SMS reviews)</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={editCustomer.phone}
                    onChange={handleEditCustomerChange}
                    placeholder="+1234567890"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Date *
                  </label>
                  <input
                    type="date"
                    name="serviceDate"
                    value={editCustomer.serviceDate}
                    onChange={handleEditCustomerChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Type *
                  </label>
                  <input
                    type="text"
                    name="serviceType"
                    value={editCustomer.serviceType}
                    onChange={handleEditCustomerChange}
                    placeholder="e.g., Kitchen Sink Repair, Oil Change, Haircut"
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={editCustomer.status}
                    onChange={handleEditCustomerChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="COMPLETED">Completed</option>
                    <option value="PENDING">Pending</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {predefinedTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleTagToggle(tag, true)}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                          editCustomer.tags.includes(tag)
                            ? "bg-blue-100 text-blue-800 border-2 border-blue-300"
                            : "bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200"
                        }`}
                      >
                        {tag.replace("_", " ").toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={editCustomer.notes}
                    onChange={handleEditCustomerChange}
                    rows={3}
                    placeholder="Any additional notes about this customer..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleUpdateCustomer}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Update Customer
                </button>
                <button
                  onClick={() => setShowEditCustomer(null)}
                  className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Details Modal */}
      {showCustomerDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Customer Details
              </h3>
              <button
                onClick={() => setShowCustomerDetails(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Name
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {showCustomerDetails.name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Business
                  </label>
                  <p className="text-lg text-gray-900">
                    {showCustomerDetails.business?.name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Email
                  </label>
                  <p className="text-lg text-gray-900">
                    {showCustomerDetails.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Phone
                  </label>
                  <p className="text-lg text-gray-900">
                    {showCustomerDetails.phone || "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Service Date
                  </label>
                  <p className="text-lg text-gray-900">
                    {showCustomerDetails.serviceDate}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Status
                  </label>
                  <span
                    className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
                      showCustomerDetails.status
                    )}`}
                  >
                    {showCustomerDetails.status.toLowerCase()}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Service Type
                </label>
                <p className="text-lg text-gray-900">
                  {showCustomerDetails.serviceType}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {showCustomerDetails.tags &&
                    showCustomerDetails.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`px-3 py-1 text-sm font-medium rounded-full ${getTagColor(
                          tag
                        )}`}
                      >
                        {tag.replace("_", " ").toLowerCase()}
                      </span>
                    ))}
                </div>
              </div>

              {showCustomerDetails.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Notes
                  </label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg mt-2">
                    {showCustomerDetails.notes}
                  </p>
                </div>
              )}

              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowCustomerDetails(null);
                    openReviewRequestModal(showCustomerDetails);
                  }}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Send Review Request
                </button>
                <button
                  onClick={() => {
                    setShowCustomerDetails(null);
                    openEditModal(showCustomerDetails);
                  }}
                  className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Edit Customer
                </button>
                <button
                  onClick={() => {
                    setShowCustomerDetails(null);
                    handleDeleteCustomer(showCustomerDetails.id);
                  }}
                  className="px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagementPage;