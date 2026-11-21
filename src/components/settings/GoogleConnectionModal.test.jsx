// ADDED (Google sync): "Is this your business?" flow + link fallback no longer wipes Facebook/Yelp
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import axios from "axios";
import GoogleConnectionModal from "./GoogleConnectionModal";
import * as googleApi from "../../api/googleApi";

vi.mock("axios");
vi.mock("../../api/googleApi", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, searchGooglePlaces: vi.fn(), connectGooglePlace: vi.fn() };
});

const business = { id: 10, name: "Acme Roofing", address: "123 Main St, Denver, CO" };

describe("GoogleConnectionModal", () => {
  afterEach(() => vi.clearAllMocks());

  it("searches by business name + address on open and connects the picked listing", async () => {
    googleApi.searchGooglePlaces.mockResolvedValue([
      { placeId: "ChIJAAAAAAAAAAAAAAAAAAAAAA1", name: "Acme Roofing", formattedAddress: "123 Main St, Denver, CO" },
    ]);
    googleApi.connectGooglePlace.mockResolvedValue({ businessId: 10, placeId: "ChIJAAAAAAAAAAAAAAAAAAAAAA1" });
    const onSuccess = vi.fn();

    render(<GoogleConnectionModal isOpen business={business} onClose={vi.fn()} onSuccess={onSuccess} />);

    expect(googleApi.searchGooglePlaces).toHaveBeenCalledWith(10, "Acme Roofing 123 Main St, Denver, CO");
    await userEvent.click(await screen.findByRole("button", { name: /this is my business: acme roofing/i }));

    expect(googleApi.connectGooglePlace).toHaveBeenCalledWith(10, "ChIJAAAAAAAAAAAAAAAAAAAAAA1");
    expect(await screen.findByRole("status")).toHaveTextContent(/connected/i);
    await waitFor(() => expect(onSuccess).toHaveBeenCalled(), { timeout: 2500 });
  });

  it("shows a helpful message when nothing matches", async () => {
    googleApi.searchGooglePlaces.mockResolvedValue([]);
    render(<GoogleConnectionModal isOpen business={business} onClose={vi.fn()} onSuccess={vi.fn()} />);
    expect(await screen.findByText(/no google listings matched/i)).toBeInTheDocument();
  });

  it("link fallback sends only the Google field (Facebook/Yelp untouched)", async () => {
    googleApi.searchGooglePlaces.mockResolvedValue([]);
    axios.put.mockResolvedValue({ data: { googlePlaceId: null } });
    render(<GoogleConnectionModal isOpen business={business} onClose={vi.fn()} onSuccess={vi.fn()} />);

    await userEvent.click(await screen.findByRole("button", { name: /paste your google link/i }));
    await userEvent.type(screen.getByLabelText(/google maps or g\.page link/i), "https://g.page/r/CZfH8POGJQGsEAI/review");
    await userEvent.click(screen.getByRole("button", { name: /save link/i }));

    await waitFor(() => expect(axios.put).toHaveBeenCalled());
    const body = axios.put.mock.calls[0][1];
    expect(body.googleReviewShortUrl).toBe("https://g.page/r/CZfH8POGJQGsEAI/review");
    expect(body).not.toHaveProperty("facebookPageUrl");
    expect(body).not.toHaveProperty("yelpPageUrl");
  });

  // ADDED (SAB fix)
  it("link fallback finishes the connection when the backend matched the link to a listing", async () => {
    googleApi.searchGooglePlaces.mockResolvedValue([]);
    axios.put.mockResolvedValue({ data: { googlePlaceId: "ChIJduckweedduckweed123" } });
    googleApi.connectGooglePlace.mockResolvedValue({ businessId: 10, placeId: "ChIJduckweedduckweed123" });
    render(<GoogleConnectionModal isOpen business={business} onClose={vi.fn()} onSuccess={vi.fn()} />);

    await userEvent.click(await screen.findByRole("button", { name: /paste your google link/i }));
    await userEvent.type(screen.getByLabelText(/google maps or g\.page link/i), "https://maps.app.goo.gl/JUVninvn7sUd4Vww9");
    await userEvent.click(screen.getByRole("button", { name: /save link/i }));

    await waitFor(() => expect(googleApi.connectGooglePlace).toHaveBeenCalledWith(10, "ChIJduckweedduckweed123"));
    expect(await screen.findByRole("status")).toHaveTextContent(/connected/i);
  });

  // ADDED (SAB fix)
  it("link fallback does not claim success when the link couldn't be matched", async () => {
    googleApi.searchGooglePlaces.mockResolvedValue([]);
    axios.put.mockResolvedValue({ data: { googlePlaceId: null } });
    const onSuccess = vi.fn();
    render(<GoogleConnectionModal isOpen business={business} onClose={vi.fn()} onSuccess={onSuccess} />);

    await userEvent.click(await screen.findByRole("button", { name: /paste your google link/i }));
    await userEvent.type(screen.getByLabelText(/google maps or g\.page link/i), "https://maps.app.goo.gl/nomatch");
    await userEvent.click(screen.getByRole("button", { name: /save link/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/couldn't match it to a Google listing/i);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(googleApi.connectGooglePlace).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
