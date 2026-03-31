import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import HomePage from "../pages/HomePage";


function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("HomePage", () => {

  it("renders main title", () => {
    renderWithRouter(<HomePage />);
    expect(screen.getByText("KU Ticket")).toBeInTheDocument();
  });

  it("shows browse concerts button", () => {
    renderWithRouter(<HomePage />);
    expect(screen.getByText(/browse concerts/i)).toBeInTheDocument();
  });

  it("link navigates to /concert", () => {
    renderWithRouter(<HomePage />);
    const link = screen.getByRole("link", { name: /browse concerts/i });
    expect(link).toHaveAttribute("href", "/concert");
  });

  it("shows feature section", () => {
    renderWithRouter(<HomePage />);
    expect(screen.getByText(/find concerts/i)).toBeInTheDocument();
    expect(screen.getByText(/easy booking/i)).toBeInTheDocument();
    expect(screen.getByText(/manage profile/i)).toBeInTheDocument();
  });

  it("renders without crashing", () => {
    renderWithRouter(<HomePage />);
  });

});