import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import ConcertPage from "../pages/ConcertPage";


function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

const mockResponse = (data, ok = true) =>
  Promise.resolve({
    ok,
    json: () => Promise.resolve(data),
  });

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
  localStorage.setItem("token", "test-token");
});

afterEach(() => {
  vi.resetAllMocks();
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe("ConcertPage", () => {

  it("shows loading state", () => {
    fetch.mockImplementation(() => new Promise(() => {})); // never resolve

    renderWithRouter(<ConcertPage />);

    expect(screen.getByText(/loading concerts/i)).toBeInTheDocument();
  });

  it("renders concerts from API", async () => {
    fetch.mockImplementationOnce(() =>
      mockResponse([
        {
          id: 1,
          name: "Big Concert",
          description: "Awesome show",
          date: "2026-01-01",
          location: "Bangkok",
          status: "available",
          image: "img.jpg",
          zones: [],
        },
      ])
    );

    renderWithRouter(<ConcertPage />);

    expect(await screen.findByText("Big Concert")).toBeInTheDocument();
  });

  it("shows error when API fails", async () => {
    fetch.mockImplementationOnce(() => mockResponse({}, false));

    renderWithRouter(<ConcertPage />);

    expect(await screen.findByText(/failed to load concerts/i)).toBeInTheDocument();
  });

  it("shows empty message when no concerts", async () => {
    fetch.mockImplementationOnce(() => mockResponse([]));

    renderWithRouter(<ConcertPage />);

    expect(await screen.findByText(/no concerts available/i)).toBeInTheDocument();
  });

  it("shows buy ticket button for available concert", async () => {
    fetch.mockImplementationOnce(() =>
      mockResponse([
        {
          id: 2,
          name: "Rock Night",
          description: "Great music",
          date: "2026-02-01",
          location: "KU",
          status: "available",
          image: "img.jpg",
          zones: [],
        },
      ])
    );

    renderWithRouter(<ConcertPage />);

    expect(await screen.findByText(/buy ticket/i)).toBeInTheDocument();
  });

});