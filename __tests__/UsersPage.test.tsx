import { render, screen } from "@testing-library/react";
import UsersPage from "@/app/(dashboard)/users/page";
import "@testing-library/jest-dom";

// Mock dependent components
jest.mock("../app/components/layout/Header", () => () => (
  <div data-testid="header">Header</div>
));
jest.mock("../app/components/users/UsersTable", () => () => (
  <div data-testid="users-table">UsersTable</div>
));

describe("UsersPage", () => {
  it("renders the page header and UsersTable", () => {
    render(<UsersPage />);

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText(/Manage platform users/i)).toBeInTheDocument();
    expect(screen.getByTestId("users-table")).toBeInTheDocument();
  });
});
