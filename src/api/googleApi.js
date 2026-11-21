// src/api/googleApi.js
// ADDED (Google sync, Places phase): client for /api/v1/businesses/{id}/google/*
// Responses are validated with zod so a backend change fails loudly here instead of deep in a component.

import axios from "axios";
import { z } from "zod";
import { buildUrl } from "../config/api";

const authHeaders = (token) => ({
  headers: { Authorization: `Bearer ${token || localStorage.getItem("token")}` },
});

export const PlaceCandidateSchema = z.object({
  placeId: z.string(),
  name: z.string().nullable().optional(),
  formattedAddress: z.string().nullable().optional(),
  googleMapsUri: z.string().nullable().optional(),
});

export const PlaceReviewSchema = z.object({
  rating: z.number().nullable().optional(),
  text: z.string().nullable().optional(),
  languageCode: z.string().nullable().optional(),
  relativePublishTimeDescription: z.string().nullable().optional(),
  publishTime: z.string().nullable().optional(),
  authorName: z.string().nullable().optional(),
  authorUri: z.string().nullable().optional(),
  authorPhotoUri: z.string().nullable().optional(),
  googleMapsUri: z.string().nullable().optional(),
});

export const PlaceReviewSummarySchema = z.object({
  placeId: z.string(),
  name: z.string().nullable().optional(),
  rating: z.number().nullable().optional(),
  userRatingCount: z.number().nullable().optional(),
  googleMapsUri: z.string().nullable().optional(),
  writeReviewUrl: z.string().nullable().optional(),
  reviews: z.array(PlaceReviewSchema).nullable().optional(),
  attribution: z.string().nullable().optional(),
  reviewsOrderNotice: z.string().nullable().optional(),
  fetchedAt: z.string().nullable().optional(),
});

export const GoogleSummaryResponseSchema = z.object({
  connected: z.boolean(),
  connectionMethod: z.string().nullable().optional(),
  fullSyncAvailable: z.boolean().optional(),
  summary: PlaceReviewSummarySchema.nullable().optional(),
  message: z.string().nullable().optional(),
});

export const ConnectPlaceResponseSchema = z.object({
  businessId: z.number(),
  placeId: z.string(),
  writeReviewUrl: z.string().nullable().optional(),
  credentialId: z.number().nullable().optional(),
  connectionMethod: z.string().nullable().optional(),
});

/** Pull a readable message out of an RFC 7807 problem+json (or older) error response. */
export const googleApiErrorMessage = (err, fallback = "Something went wrong. Please try again.") =>
  err?.response?.data?.detail ||
  err?.response?.data?.message ||
  err?.response?.data?.error ||
  fallback;

/** "Is this your business?" candidates. Omit query to search by the business's name + address. */
export async function searchGooglePlaces(businessId, query, token) {
  const params = query && query.trim() ? `?query=${encodeURIComponent(query.trim())}` : "";
  const res = await axios.get(
    buildUrl(`/api/v1/businesses/${businessId}/google/search${params}`),
    authHeaders(token)
  );
  return z.array(PlaceCandidateSchema).parse(res.data);
}

/** Connect the business to a Google listing by Place ID. */
export async function connectGooglePlace(businessId, placeId, token) {
  const res = await axios.post(
    buildUrl(`/api/v1/businesses/${businessId}/google/connect`),
    { placeId },
    authHeaders(token)
  );
  return ConnectPlaceResponseSchema.parse(res.data);
}

/**
 * Live Google rating + up to 5 reviews. Google bills per call and its terms forbid storing the result,
 * so call this once per business view, not on every render.
 */
export async function fetchGoogleSummary(businessId, token) {
  const res = await axios.get(
    buildUrl(`/api/v1/businesses/${businessId}/google/summary`),
    authHeaders(token)
  );
  return GoogleSummaryResponseSchema.parse(res.data);
}
