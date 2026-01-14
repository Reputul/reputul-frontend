import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useBusiness } from "../context/BusinessContext";
import { Zap } from "lucide-react";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isBusinessDropdownOpen, setIsBusinessDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    selectedBusiness,
    businesses,
    loading: businessesLoading,
    selectBusiness,
  } = useBusiness();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsBusinessDropdownOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (path) => {
    // For settings sub-pages, use exact match
    if (path.startsWith("/settings")) {
      return location.pathname === path;
    }

    // For other paths, use the original logic
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Filter businesses based on search
  const filteredBusinesses = businesses.filter((business) =>
    business.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get business initials for icon
  const getBusinessInitials = (name) => {
    if (!name) return "?";
    const words = name.split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const navigationGroups = [
    {
      title: "Main",
      items: [
        {
          name: "Dashboard",
          path: "/dashboard",
          icon: (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          ),
        },
        {
          name: "Insights",
          path: "/insights",
          icon: (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          ),
        },
        {
          name: "Contacts",
          path: "/contacts",
          icon: (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          ),
        },
      ],
    },
    {
      title: "Reviews",
      items: [
        {
          name: "All Reviews", // ← NEW: This is your Reviews Management page
          path: "/reviews",
          icon: (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          ),
        },
        {
          name: "Review Requests",
          path: "/review-requests",
          icon: (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          ),
        },
      ],
    },
    {
      title: "Marketing",
      items: [
        {
          name: "Email Templates",
          path: "/email-templates",
          icon: (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          ),
        },
        {
          name: "Campaigns",
          path: "/campaigns",
          icon: (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
            />
          ),
        },
        {
          name: "Widgets",
          path: "/widgets",
          icon: (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
            />
          ),
        },
      ],
    },
    {
      title: "Settings",
      items: [
        {
          name: "Business Profile",
          path: "/business/settings",
          icon: (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          ),
        },
        {
          name: "Platform Settings",
          path: "/settings",
          icon: (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
          ),
        },
        {
          name: "Integrations",
          path: "/settings/integrations",
          icon: (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          ),
        },
        {
          name: "Account & Billing",
          path: "/account/billing",
          icon: (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          ),
        },
      ],
    },
  ];

  return (
    <div
      className={`bg-slate-900 h-screen flex flex-col transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* NEW: Business Selector Header (replaces logo) */}
      <div className="p-4 border-b border-slate-800">
        <div className="relative" ref={dropdownRef}>
          {/* Business Selector Button */}
          <button
            onClick={() => setIsBusinessDropdownOpen(!isBusinessDropdownOpen)}
            className={`w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-800 transition-all duration-200 ${
              isBusinessDropdownOpen ? "bg-slate-800" : ""
            }`}
            disabled={businessesLoading || businesses.length === 0}
          >
            {/* Business Icon */}
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
              {businessesLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              ) : selectedBusiness ? (
                getBusinessInitials(selectedBusiness.name)
              ) : (
                "?"
              )}
            </div>

            {/* Business Name (hidden when collapsed) */}
            {!isCollapsed && (
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {businessesLoading
                    ? "Loading..."
                    : selectedBusiness
                    ? selectedBusiness.name
                    : "No Business"}
                </p>
                {selectedBusiness && (
                  <p className="text-xs text-slate-400 truncate">
                    {selectedBusiness.industry || "Business"}
                  </p>
                )}
              </div>
            )}

            {/* Dropdown Arrow (hidden when collapsed or loading) */}
            {!isCollapsed && !businessesLoading && businesses.length > 0 && (
              <svg
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  isBusinessDropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            )}
          </button>

          {/* Business Dropdown Menu */}
          {isBusinessDropdownOpen && !isCollapsed && businesses.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 rounded-lg shadow-2xl border border-slate-700 z-50 max-h-96 overflow-hidden flex flex-col">
              {/* Search Input (only show if 5+ businesses) */}
              {businesses.length >= 5 && (
                <div className="p-2 border-b border-slate-700">
                  <input
                    type="text"
                    placeholder="Search businesses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}

              {/* Business List */}
              <div className="overflow-y-auto max-h-64">
                {filteredBusinesses.length > 0 ? (
                  filteredBusinesses.map((business) => (
                    <button
                      key={business.id}
                      onClick={() => {
                        selectBusiness(business);
                        setIsBusinessDropdownOpen(false);
                        setSearchTerm("");
                      }}
                      className={`w-full flex items-center space-x-3 p-3 hover:bg-slate-700 transition-colors ${
                        selectedBusiness?.id === business.id
                          ? "bg-slate-700"
                          : ""
                      }`}
                    >
                      {/* Business Icon */}
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                        {getBusinessInitials(business.name)}
                      </div>

                      {/* Business Info */}
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {business.name}
                        </p>
                        {business.industry && (
                          <p className="text-xs text-slate-400 truncate">
                            {business.industry}
                          </p>
                        )}
                      </div>

                      {/* Checkmark if selected */}
                      {selectedBusiness?.id === business.id && (
                        <svg
                          className="w-5 h-5 text-blue-500 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-400 text-sm">
                    No businesses found
                  </div>
                )}
              </div>

              {/* Add New Business Button */}
              <div className="p-2 border-t border-slate-700">
                <Link
                  to="/dashboard"
                  onClick={() => {
                    setIsBusinessDropdownOpen(false);
                    setSearchTerm("");
                    // TODO: Open Add Business Modal
                  }}
                  className="w-full flex items-center space-x-2 p-2 text-blue-400 hover:bg-slate-700 rounded-md transition-colors"
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
                  <span className="text-sm font-medium">Add New Business</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Collapse Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="mt-3 w-full p-2 hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center text-slate-400 hover:text-white"
        >
          <svg
            className={`w-5 h-5 transition-transform duration-300 ${
              isCollapsed ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={
                isCollapsed
                  ? "M13 5l7 7-7 7M5 5l7 7-7 7"
                  : "M11 19l-7-7 7-7m8 14l-7-7 7-7"
              }
            />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {navigationGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-6">
            {!isCollapsed && (
              <div className="px-4 mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {group.title}
                </span>
              </div>
            )}
            <div className="space-y-1 px-2">
              {group.items.map((item, itemIndex) => (
                <Link
                  key={itemIndex}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
                    isActive(item.path)
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/50"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                  title={isCollapsed ? item.name : ""}
                >
                  <svg
                    className="w-5 h-5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {item.icon}
                  </svg>
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 font-medium">{item.name}</span>
                      {item.badge && (
                        <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                      {item.name}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-slate-800">
        <div
          className={`flex items-center ${
            isCollapsed ? "justify-center" : "space-x-3"
          } p-3 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer group`}
        >
          <div className="relative flex-shrink-0">
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900"></div>
          </div>

          {!isCollapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {user?.email || ""}
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                title="Logout"
              >
                <svg
                  className="w-5 h-5 text-slate-400 hover:text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
