import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import UserProfilePage from "../pages/UserProfilePage";
import { BrowserRouter } from "react-router-dom";

// mock navigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("UserProfilePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    Storage.prototype.getItem = vi.fn(() => "fake-token");

    global.fetch = vi.fn((url) => {
      if (url.includes("/profile")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({ username: "john", email: "john@mail.com" }),
        });
      }
      if (url.includes("/stats")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              total_topup_amount: 1000,
              total_spend_amount: 500,
              total_refunded_amount: 100,
              total_bookings_count: 5,
              total_canceled_count: 1,
            }),
        });
      }
      if (url.includes("/bookings")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
    });
  });

  const renderPage = () =>
    render(
      <BrowserRouter>
        <UserProfilePage />
      </BrowserRouter>
    );

  it("should render username and email from API", async () => {
    renderPage();

    expect(await screen.findByText("john")).toBeInTheDocument();
    expect(await screen.findByText("john@mail.com")).toBeInTheDocument();
  });

  it("should allow editing username", async () => {
    renderPage();

    const editBtn = await screen.findAllByText("Edit");
    fireEvent.click(editBtn[0]);

    const input = screen.getByDisplayValue("john");
    fireEvent.change(input, { target: { value: "newname" } });

    expect(input.value).toBe("newname");
  });

  it("should save username successfully", async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ username: "john", email: "john@mail.com" }),
      })
    );

    renderPage();

    const editBtn = await screen.findAllByText("Edit");
    fireEvent.click(editBtn[0]);

    const input = screen.getByDisplayValue("john");
    fireEvent.change(input, { target: { value: "newname" } });

    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(screen.getByText("Username updated successfully!")).toBeInTheDocument();
    });
  });

  it("should cancel editing username", async () => {
    renderPage();

    const editBtn = await screen.findAllByText("Edit");
    fireEvent.click(editBtn[0]);

    const input = screen.getByDisplayValue("john");
    fireEvent.change(input, { target: { value: "newname" } });

    fireEvent.click(screen.getByText("Cancel"));

    expect(screen.getByText("john")).toBeInTheDocument();
  });

  it("should navigate to history page", async () => {
    renderPage();

    const btn = await screen.findByText(/View Transaction History/i);
    fireEvent.click(btn);

    expect(mockNavigate).toHaveBeenCalledWith("/history");
  });

  it("should show no booked tickets", async () => {
    renderPage();

    expect(
      await screen.findByText("No booked tickets found.")
    ).toBeInTheDocument();
  });
});