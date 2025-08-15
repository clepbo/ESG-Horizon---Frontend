/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from "@testing-library/react";
import SettingsPage from "@/app/(admin)/settings/page"; // Adjust path as needed

// ✅ Mocks
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => <img {...props} alt={props.alt || "mocked image"} />,
}));

jest.mock("lucide-react", () => ({
  Edit: () => <svg data-testid="edit-icon" />,
}));

jest.mock("../app/components/layout/Header", () => () => (
  <div data-testid="header">Header</div>
));

jest.mock("../app/components/ui/StatusBadge", () => ({ status }: any) => (
  <div data-testid="status-badge">{status}</div>
));

jest.mock("../app/components/users/EditUserModal", () => ({
  __esModule: true,
  default: ({ onClose, user }: any) => (
    <div data-testid="edit-modal">
      Modal Content for {user.name}
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

// ✅ Tests
describe("SettingsPage", () => {
  beforeEach(() => {
    render(<SettingsPage />);
  });

  it("renders header, profile info, and personal details", () => {
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByText("Israel Oni")).toBeInTheDocument();

    // Use all instances of "Super Admin"
    const superAdminElements = screen.getAllByText("Super Admin");
    expect(superAdminElements.length).toBeGreaterThanOrEqual(1);

    expect(screen.getByText("Personal Information")).toBeInTheDocument();
    expect(screen.getByText("First Name")).toBeInTheDocument();
    expect(screen.getByText("Israel")).toBeInTheDocument();
    expect(screen.getByText("Last Name")).toBeInTheDocument();
    expect(screen.getByText("Oni")).toBeInTheDocument();
    expect(screen.getByText("Email Address")).toBeInTheDocument();
    expect(
      screen.getByText("israel.oni@teasooconsulting.com")
    ).toBeInTheDocument();
  });

  it("opens and closes the edit modal when Edit button is clicked", () => {
    const editButtons = screen.getAllByRole("button", { name: /edit/i });
    expect(editButtons.length).toBeGreaterThan(0);

    fireEvent.click(editButtons[0]);
    expect(screen.getByTestId("edit-modal")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Close"));
    expect(screen.queryByTestId("edit-modal")).not.toBeInTheDocument();
  });
});
