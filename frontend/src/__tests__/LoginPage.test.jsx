import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "../pages/LoginPage";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

const mockLogin = vi.fn();
vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("should render login form", () => {
    render(<LoginPage />);

    expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();

    // แยก check ทีละ input
    expect(screen.getByRole("textbox")).toBeInTheDocument(); // username
    expect(document.querySelector('input[type="password"]')).toBeInTheDocument(); // password
  });

  it("should update input values", () => {
    render(<LoginPage />);

    const username = screen.getByRole("textbox");
    const password = document.querySelector('input[type="password"]');

    fireEvent.change(username, { target: { value: "testuser" } });
    fireEvent.change(password, { target: { value: "1234" } });

    expect(username.value).toBe("testuser");
    expect(password.value).toBe("1234");
  });

  it("should login successfully and navigate", async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: "token123" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ username: "testuser" }),
      });

    render(<LoginPage />);

    const username = screen.getByRole("textbox");
    const password = document.querySelector('input[type="password"]');

    fireEvent.change(username, { target: { value: "testuser" } });
    fireEvent.change(password, { target: { value: "1234" } });

    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/home");
    });
  });

  it("should fallback login when profile fetch fails", async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: "token123" }),
      })
      .mockResolvedValueOnce({ ok: false });

    render(<LoginPage />);

    const username = screen.getByRole("textbox");
    const password = document.querySelector('input[type="password"]');

    fireEvent.change(username, { target: { value: "fallbackUser" } });
    fireEvent.change(password, { target: { value: "1234" } });

    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({ username: "fallbackUser" });
    });
  });

  it("should show error message when login fails", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Invalid credentials" }),
    });

    render(<LoginPage />);

    const username = screen.getByRole("textbox");
    const password = document.querySelector('input[type="password"]');

    fireEvent.change(username, { target: { value: "wrong" } });
    fireEvent.change(password, { target: { value: "wrong" } });

    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
  });

  it("should show server error when fetch throws", async () => {
    global.fetch.mockRejectedValueOnce(new Error("error"));

    render(<LoginPage />);

    const username = screen.getByRole("textbox");
    const password = document.querySelector('input[type="password"]');

    fireEvent.change(username, { target: { value: "user" } });
    fireEvent.change(password, { target: { value: "pass" } });

    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(screen.getByText("Server error")).toBeInTheDocument();
    });
  });

  it("should navigate to register page", () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByText("Register"));
    expect(mockNavigate).toHaveBeenCalledWith("/register");
  });
});