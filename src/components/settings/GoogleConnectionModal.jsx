// src/components/settings/GoogleConnectionModal.jsx
// Modal for connecting a Google Business Profile listing.
//
// CHANGED (Google sync, Places phase):
// - Primary flow is now "Is this your business?": we search Google by the business's name + address and
//   the owner picks their listing. That stores the real Place ID (POST /google/connect), so review links
//   always open Google's "write a review" box and the dashboard can show the live Google rating.
// - Pasting a Maps or g.page link is kept as a fallback. It no longer sends facebookPageUrl/yelpPageUrl as
//   null (that used to wipe the business's Facebook and Yelp links).
// - "Sign in with Google" stays disabled until Google approves Business Profile API access.

import React, { useCallback, useEffect, useRef, useState } from "react";
import { X, ArrowLeft, AlertCircle, CheckCircle, Search, MapPin, Link as LinkIcon } from "lucide-react";
import axios from "axios";
import { buildUrl } from "../../config/api";
import { searchGooglePlaces, connectGooglePlace, googleApiErrorMessage } from "../../api/googleApi";

const GoogleLogo = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

// Same check as before: accept Google Maps links and g.page review links for the fallback
const isGoogleLink = (url) =>
  url.includes("google.com/maps") ||
  url.includes("goo.gl/maps") ||
  url.includes("maps.app.goo.gl") ||
  url.includes("g.page/");

const GoogleConnectionModal = ({ isOpen, onClose, business, onSuccess }) => {
  const defaultQuery = [business?.name, business?.address].filter(Boolean).join(" ");

  const [query, setQuery] = useState(defaultQuery);
  const [searching, setSearching] = useState(false);
  const [candidates, setCandidates] = useState(null); // null = not searched yet
  const [connectingId, setConnectingId] = useState(null);
  const [showLinkFallback, setShowLinkFallback] = useState(false);
  const [googleMapsUrl, setGoogleMapsUrl] = useState("");
  const [savingLink, setSavingLink] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const searchInputRef = useRef(null);

  const runSearch = useCallback(
    async (q) => {
      if (!business?.id) return;
      setError(null);
      setSearching(true);
      try {
        const results = await searchGooglePlaces(business.id, q);
        setCandidates(results);
      } catch (err) {
        setCandidates([]);
        setError(googleApiErrorMessage(err, "We couldn't search Google right now. Try again, or paste your link below."));
      } finally {
        setSearching(false);
      }
    },
    [business?.id]
  );

  // Search automatically when the modal opens, using the business's name + address
  useEffect(() => {
    if (isOpen && business?.id) {
      setQuery(defaultQuery);
      runSearch(defaultQuery);
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, business?.id]);

  const finish = () => {
    setSuccess(true);
    setTimeout(() => onSuccess?.(), 1500);
  };

  const handlePick = async (placeId) => {
    setError(null);
    setConnectingId(placeId);
    try {
      await connectGooglePlace(business.id, placeId);
      finish();
    } catch (err) {
      setError(googleApiErrorMessage(err, "Failed to connect that listing. Please try again."));
    } finally {
      setConnectingId(null);
    }
  };

  // Fallback: paste a Google Maps / g.page link
  const handleSaveLink = async () => {
    setError(null);
    if (!googleMapsUrl.trim()) {
      setError("Please paste your Google Maps or g.page link.");
      return;
    }
    if (!isGoogleLink(googleMapsUrl)) {
      setError("That doesn't look like a Google Maps link. Please check and try again.");
      return;
    }
    setSavingLink(true);
    try {
      await axios.put(
        buildUrl(`/api/v1/businesses/${business.id}/review-platforms`),
        {
          // CHANGED: only send the Google field. Omitting facebookPageUrl / yelpPageUrl leaves them unchanged.
          googlePlaceId: null, // backend extracts or looks it up when it can
          googleReviewShortUrl: googleMapsUrl.trim(),
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      finish();
    } catch (err) {
      setError(googleApiErrorMessage(err, "Failed to save your Google link. Please try again."));
    } finally {
      setSavingLink(false);
    }
  };

  if (!isOpen) return null;

  const busy = searching || connectingId !== null || savingLink || success;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="google-connect-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
            <span className="font-medium">Back</span>
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <h2 id="google-connect-title" className="text-2xl font-bold text-center mb-2">
            Find your Google listing
          </h2>
          <p className="text-sm text-gray-600 text-center mb-6">
            Pick your business so review requests send customers straight to your Google review box.
          </p>

          {/* Search */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              runSearch(query);
            }}
            className="flex gap-2 mb-4"
            role="search"
          >
            <label htmlFor="google-search" className="sr-only">
              Business name and city
            </label>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
              <input
                id="google-search"
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Business name and city"
                className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                disabled={busy}
              />
            </div>
            <button
              type="submit"
              disabled={busy || !query.trim()}
              className="px-4 py-2.5 rounded-lg bg-gray-900 text-white font-medium disabled:opacity-50"
            >
              Search
            </button>
          </form>

          {/* Results */}
          <div aria-live="polite" aria-busy={searching}>
            {searching && (
              <ul className="space-y-2" aria-hidden="true" data-testid="google-search-skeleton">
                {[0, 1, 2].map((i) => (
                  <li key={i} className="h-16 rounded-lg bg-gray-100 animate-pulse" />
                ))}
              </ul>
            )}

            {!searching && candidates && candidates.length === 0 && !error && (
              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                No Google listings matched. Try your business name plus your city, or paste your link below.
              </p>
            )}

            {!searching && candidates && candidates.length > 0 && (
              <ul className="space-y-2">
                {candidates.map((c) => (
                  <li key={c.placeId} className="border border-gray-200 rounded-lg p-3 flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{c.name}</p>
                      <p className="text-sm text-gray-600 truncate">{c.formattedAddress}</p>
                      {c.googleMapsUri && (
                        <a
                          href={c.googleMapsUri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          View on Google Maps
                        </a>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handlePick(c.placeId)}
                      disabled={busy}
                      className="px-3 py-1.5 rounded-lg bg-[#7d2ae8] text-white text-sm font-medium hover:bg-[#6b21d1] disabled:opacity-50 whitespace-nowrap"
                      aria-label={`This is my business: ${c.name}`}
                    >
                      {connectingId === c.placeId ? "Connecting..." : "This is me"}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Error / success */}
          {error && (
            <div role="alert" className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          {success && (
            <div role="status" className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <p className="text-sm text-green-800">Google listing connected!</p>
            </div>
          )}

          {/* Fallback: paste a link */}
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowLinkFallback((v) => !v)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
              aria-expanded={showLinkFallback}
            >
              <LinkIcon className="w-4 h-4" aria-hidden="true" />
              Can't find it? Paste your Google link instead
            </button>

            {showLinkFallback && (
              <div className="mt-3 space-y-3">
                <label htmlFor="google-link" className="block text-sm font-medium text-gray-700">
                  Google Maps or g.page link
                </label>
                <input
                  id="google-link"
                  type="url"
                  placeholder="https://maps.app.goo.gl/... or https://g.page/r/.../review"
                  value={googleMapsUrl}
                  onChange={(e) => setGoogleMapsUrl(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  disabled={busy}
                />
                <ol className="text-xs text-gray-600 list-decimal list-inside space-y-0.5">
                  <li>Search for your business on Google Maps</li>
                  <li>Click "Share" and copy the link</li>
                  <li>Paste it above</li>
                </ol>
                <button
                  type="button"
                  onClick={handleSaveLink}
                  disabled={busy}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg py-2.5 px-6 font-semibold transition-colors"
                >
                  {savingLink ? "Saving..." : "Save link"}
                </button>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white text-sm text-gray-500">Coming soon</span>
            </div>
          </div>

          {/* OAuth (disabled until Google approves Business Profile API access) */}
          <button
            disabled
            className="w-full bg-black text-white rounded-full py-3 px-6 flex items-center justify-center gap-3 opacity-40 cursor-not-allowed"
          >
            <GoogleLogo />
            Sign in with Google
          </button>
          <p className="text-xs text-gray-500 text-center mt-2">
            Full review history and replying to Google reviews from Reputul.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GoogleConnectionModal;
