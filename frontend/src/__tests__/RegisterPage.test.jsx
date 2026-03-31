import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import RegisterPage from "../pages/RegisterPage"; // แก้ path ให้ตรง
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

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  const renderPage = () =>
    render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    );

  // helper: get inputs
  const getInputs = () => {
    const textInputs = screen.getAllByRole("textbox"); // email, username
    const passwordInputs = screen.getAllByDisplayValue(""); // password, confirm

    return {
      emailInput: textInputs[0],
      usernameInput: textInputs[1],
      passwordInput: passwordInputs[2],
      confirmPasswordInput: passwordInputs[3],
    };
  };


  it("should render register form", () => {
    renderPage();

    expect(screen.getAllByText("Register").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("textbox").length).toBe(2);
  });


  it("should show error for invalid email", () => {
    renderPage();

    const { emailInput, usernameInput, passwordInput, confirmPasswordInput } = getInputs();

    fireEvent.change(emailInput, { target: { value: "invalid" } });
    fireEvent.change(usernameInput, { target: { value: "john" } });
    fireEvent.change(passwordInput, { target: { value: "1234" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "1234" } });


    fireEvent.submit(screen.getByRole("button").closest("form"));

    expect(screen.getByText("Invalid email format")).toBeInTheDocument();
    });


  it("should show error when passwords do not match", () => {
    renderPage();

    const { emailInput, usernameInput, passwordInput, confirmPasswordInput } = getInputs();

    fireEvent.change(emailInput, { target: { value: "test@mail.com" } });
    fireEvent.change(usernameInput, { target: { value: "john" } });
    fireEvent.change(passwordInput, { target: { value: "1234" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "9999" } });

    fireEvent.click(screen.getAllByText("Register")[1]);

    expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
  });


  it("should register successfully and navigate to login", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "success" }),
    });

    renderPage();

    const { emailInput, usernameInput, passwordInput, confirmPasswordInput } = getInputs();

    fireEvent.change(emailInput, { target: { value: "test@mail.com" } });
    fireEvent.change(usernameInput, { target: { value: "john" } });
    fireEvent.change(passwordInput, { target: { value: "1234" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "1234" } });

    fireEvent.click(screen.getAllByText("Register")[1]);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });


  it("should show API error message", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "User already exists" }),
    });

    renderPage();

    const { emailInput, usernameInput, passwordInput, confirmPasswordInput } = getInputs();

    fireEvent.change(emailInput, { target: { value: "test@mail.com" } });
    fireEvent.change(usernameInput, { target: { value: "john" } });
    fireEvent.change(passwordInput, { target: { value: "1234" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "1234" } });

    fireEvent.click(screen.getAllByText("Register")[1]);

    await waitFor(() => {
      expect(screen.getByText("User already exists")).toBeInTheDocument();
    });
  });


  it("should handle network error", async () => {
    fetch.mockRejectedValueOnce(new Error("Network error"));

    renderPage();

    const { emailInput, usernameInput, passwordInput, confirmPasswordInput } = getInputs();

    fireEvent.change(emailInput, { target: { value: "test@mail.com" } });
    fireEvent.change(usernameInput, { target: { value: "john" } });
    fireEvent.change(passwordInput, { target: { value: "1234" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "1234" } });

    fireEvent.click(screen.getAllByText("Register")[1]);

    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });
  });


  it("should send correct data to API", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "success" }),
    });

    renderPage();

    const { emailInput, usernameInput, passwordInput, confirmPasswordInput } = getInputs();

    fireEvent.change(emailInput, { target: { value: "test@mail.com" } });
    fireEvent.change(usernameInput, { target: { value: "john" } });
    fireEvent.change(passwordInput, { target: { value: "1234" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "1234" } });

    fireEvent.click(screen.getAllByText("Register")[1]);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "http://127.0.0.1:5000/api/auth/register",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "test@mail.com",
            username: "john",
            password: "1234",
          }),
        })
      );
    });
  });
});