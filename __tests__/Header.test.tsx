import { render, screen } from "@testing-library/react";
import Header from "@/app/components/layout/Header";
import "@testing-library/jest-dom";

describe("Header", () => {
  it("renders the admin avatar", () => {
    const { getByAltText } = render(<Header />);
    const avatar = getByAltText("Admin Avatar");
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute("src", expect.stringContaining("image.png"));
  });

  it("displays the admin name", () => {
    render(<Header />);
    expect(screen.getByText("Israel Oni")).toBeInTheDocument();
  });

  it("displays the Super Admin badge", () => {
    render(<Header />);
    const badge = screen.getByText("Super Admin");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-blue-600");
  });
});
