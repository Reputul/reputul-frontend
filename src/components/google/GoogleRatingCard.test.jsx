// ADDED (Google sync): GoogleRatingCard states + Google attribution requirements
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import GoogleRatingCard from "./GoogleRatingCard";
import * as googleApi from "../../api/googleApi";

vi.mock("../../api/googleApi", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, fetchGoogleSummary: vi.fn() };
});

const renderCard = () =>
  render(
    <MemoryRouter>
      <GoogleRatingCard businessId={10} token="t" />
    </MemoryRouter>
  );

describe("GoogleRatingCard", () => {
  afterEach(() => vi.clearAllMocks());

  it("shows a skeleton while loading", () => {
    googleApi.fetchGoogleSummary.mockReturnValue(new Promise(() => {}));
    renderCard();
    expect(screen.getByTestId("google-rating-skeleton")).toBeInTheDocument();
  });

  it("prompts to connect when Google isn't connected", async () => {
    googleApi.fetchGoogleSummary.mockResolvedValue({ connected: false, message: "Connect your Google listing." });
    renderCard();
    expect(await screen.findByRole("link", { name: /connect google/i })).toHaveAttribute("href", "/settings");
  });

  it("renders rating, count, reviews with author credit, ordering notice and Google attribution", async () => {
    googleApi.fetchGoogleSummary.mockResolvedValue({
      connected: true,
      connectionMethod: "PLACES",
      fullSyncAvailable: false,
      summary: {
        placeId: "ChIJN1t_tDeuEmsRUsoyG83frY4",
        rating: 4.8,
        userRatingCount: 127,
        googleMapsUri: "https://maps.google.com/?cid=123",
        writeReviewUrl: "https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4",
        attribution: "Google Maps",
        reviewsOrderNotice: "Showing up to 5 of the most relevant Google reviews",
        reviews: [
          {
            rating: 5,
            text: "Fixed our roof fast.",
            authorName: "Pat Lee",
            authorUri: "https://www.google.com/maps/contrib/1",
            relativePublishTimeDescription: "2 weeks ago",
            googleMapsUri: "https://www.google.com/maps/reviews/1",
          },
        ],
      },
    });
    renderCard();

    expect(await screen.findByTestId("google-rating-value")).toHaveTextContent("4.8");
    expect(screen.getByText(/127 Google reviews/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Pat Lee" })).toHaveAttribute("href", "https://www.google.com/maps/contrib/1");
    expect(screen.getByText(/most relevant Google reviews/)).toBeInTheDocument();
    expect(screen.getByTestId("google-attribution")).toHaveTextContent("Google Maps");
    expect(screen.getByRole("link", { name: /view on google maps/i })).toHaveAttribute("href", "https://maps.google.com/?cid=123");
  });

  it("shows an error with retry when the request fails", async () => {
    googleApi.fetchGoogleSummary.mockRejectedValue({ response: { data: { detail: "Business not found" } } });
    renderCard();
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Business not found"));
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });
});
