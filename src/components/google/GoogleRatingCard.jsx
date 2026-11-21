// src/components/google/GoogleRatingCard.jsx
// ADDED (Google sync, Places phase): live Google rating, review count and up to 5 reviews.
//
// Google Maps Platform terms (Places API): this data is fetched live and never stored. When shown we must
//   - attribute Google ("Google Maps"),
//   - credit each review's author (photo + name, linked to their profile when we have the link),
//   - link to the listing / review on Google Maps,
//   - say how the reviews are ordered.

import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star, ExternalLink, RefreshCw } from "lucide-react";
import { fetchGoogleSummary, googleApiErrorMessage } from "../../api/googleApi";

const Stars = ({ value = 0, size = 16 }) => (
  <span className="inline-flex" aria-hidden="true">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        size={size}
        className={i <= Math.round(value) ? "fill-amber-400 text-amber-400" : "text-slate-300"}
      />
    ))}
  </span>
);

const Skeleton = () => (
  <div className="animate-pulse space-y-3" data-testid="google-rating-skeleton" aria-hidden="true">
    <div className="h-8 w-24 bg-slate-200 rounded" />
    <div className="h-4 w-40 bg-slate-200 rounded" />
    <div className="h-16 w-full bg-slate-100 rounded" />
    <div className="h-16 w-full bg-slate-100 rounded" />
  </div>
);

const GoogleRatingCard = ({ businessId, token }) => {
  const [state, setState] = useState({ loading: true, error: null, data: null });

  const load = useCallback(async () => {
    if (!businessId) return;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await fetchGoogleSummary(businessId, token);
      setState({ loading: false, error: null, data });
    } catch (err) {
      setState({ loading: false, error: googleApiErrorMessage(err, "Couldn't load your Google rating."), data: null });
    }
  }, [businessId, token]);

  // One call per business view (Google bills per call)
  useEffect(() => {
    load();
  }, [load]);

  const { loading, error, data } = state;
  const summary = data?.summary;

  return (
    <section
      className="bg-white rounded-xl border border-slate-200 shadow-sm p-6"
      aria-labelledby="google-rating-heading"
      aria-busy={loading}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 id="google-rating-heading" className="font-bold text-slate-900">
          Google rating
        </h3>
        {!loading && data?.connected && (
          <button
            type="button"
            onClick={load}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7d2ae8]"
            aria-label="Refresh Google rating"
          >
            <RefreshCw size={16} />
          </button>
        )}
      </div>

      {loading && <Skeleton />}

      {!loading && error && (
        <div role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
          {error}{" "}
          <button type="button" onClick={load} className="underline font-medium">
            Try again
          </button>
        </div>
      )}

      {!loading && !error && data && !data.connected && (
        <div className="text-sm text-slate-600 space-y-3">
          <p>{data.message || "Connect your Google listing to see your Google rating here."}</p>
          <Link
            to="/settings"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-[#7d2ae8] text-white font-medium hover:bg-[#6b21d1] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#7d2ae8]"
          >
            Connect Google
          </Link>
        </div>
      )}

      {!loading && !error && data?.connected && !summary && (
        <p className="text-sm text-slate-600">
          {data.message || "Google is temporarily unavailable. Try again in a few minutes."}
        </p>
      )}

      {!loading && !error && summary && (
        <div>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-bold text-slate-900" data-testid="google-rating-value">
              {summary.rating != null ? summary.rating.toFixed(1) : "–"}
            </span>
            <div className="pb-1">
              <Stars value={summary.rating || 0} />
              <p className="text-xs text-slate-500">
                <span className="sr-only">{summary.rating} out of 5 stars, </span>
                {(summary.userRatingCount || 0).toLocaleString()} Google review
                {summary.userRatingCount === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-3 text-xs">
            {summary.googleMapsUri && (
              <a
                href={summary.googleMapsUri}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#7d2ae8] hover:underline"
              >
                View on Google Maps <ExternalLink size={12} aria-hidden="true" />
              </a>
            )}
            {summary.writeReviewUrl && (
              <a
                href={summary.writeReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#7d2ae8] hover:underline"
              >
                Your review link <ExternalLink size={12} aria-hidden="true" />
              </a>
            )}
          </div>

          {summary.reviews && summary.reviews.length > 0 && (
            <div className="mt-5">
              <p className="text-xs text-slate-500 mb-2">{summary.reviewsOrderNotice}</p>
              <ul className="space-y-4">
                {summary.reviews.map((r, idx) => {
                  const author = r.authorName || "Google user";
                  const authorEl = r.authorUri ? (
                    <a href={r.authorUri} target="_blank" rel="noopener noreferrer" className="font-medium text-slate-900 hover:underline">
                      {author}
                    </a>
                  ) : (
                    <span className="font-medium text-slate-900">{author}</span>
                  );
                  return (
                    <li key={r.googleMapsUri || `${author}-${idx}`} className="border-t border-slate-100 pt-3 first:border-0 first:pt-0">
                      <div className="flex items-center gap-2 text-sm">
                        {r.authorPhotoUri ? (
                          <img src={r.authorPhotoUri} alt="" className="w-7 h-7 rounded-full" referrerPolicy="no-referrer" />
                        ) : (
                          <span className="w-7 h-7 rounded-full bg-slate-200" aria-hidden="true" />
                        )}
                        {authorEl}
                        <span className="text-slate-400 text-xs ml-auto">{r.relativePublishTimeDescription}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <Stars value={r.rating || 0} size={12} />
                        <span className="sr-only">{r.rating} out of 5 stars</span>
                      </div>
                      {r.text && <p className="text-sm text-slate-700 mt-1 line-clamp-4">{r.text}</p>}
                      {r.googleMapsUri && (
                        <a
                          href={r.googleMapsUri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-slate-500 hover:underline"
                        >
                          See on Google Maps
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Required Google attribution for Places content shown without a Google map */}
          <p className="mt-5 text-xs text-slate-500" data-testid="google-attribution">
            Ratings and reviews from <span className="font-medium">{summary.attribution || "Google Maps"}</span>
          </p>

          {data.connectionMethod === "PLACES" && !data.fullSyncAvailable && (
            <p className="mt-2 text-xs text-slate-400">
              Full Google review history and replying from Reputul are coming soon.
            </p>
          )}
        </div>
      )}
    </section>
  );
};

export default GoogleRatingCard;
