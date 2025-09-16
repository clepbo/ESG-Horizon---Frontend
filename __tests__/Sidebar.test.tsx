import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import Sidebar from "@/app/components/layout/Sidebar";
import { usePathname } from "next/navigation";

// Mock next/image
jest.mock("next/image", () => (props: any) => {
  const { priority, ...rest } = props;
  return <img {...rest} alt={rest.alt || "mocked image"} />;
});

// Mock usePathname
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

const mockUsePathname = usePathname as jest.Mock;

describe("Sidebar Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders all navigation links", () => {
    mockUsePathname.mockReturnValue("/dashboard");
    render(<Sidebar />);

    const navItems = [
      "Dashboard",
      "Users",
      "Reports",
      "Subscription & Billing",
      "Settings",
    ];

    navItems.forEach((item) => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
  });

  test("highlights active link based on pathname", () => {
    mockUsePathname.mockReturnValue("/billing");
    render(<Sidebar />);

    const activeLink = screen.getByText("Subscription & Billing").closest("a");

    expect(activeLink).toHaveClass("bg-emerald-100");
    expect(activeLink).toHaveClass("text-emerald-700");
    expect(activeLink).toHaveClass("font-semibold");
  });

  test("renders icons for each link", () => {
    mockUsePathname.mockReturnValue("/dashboard");
    render(<Sidebar />);

    const iconElements = screen.getAllByRole("img", { hidden: true });
    expect(iconElements.length).toBeGreaterThan(0);
  });

  test("renders logo and favicon images", () => {
    mockUsePathname.mockReturnValue("/dashboard");
    render(<Sidebar />);

    const logoImages = screen.getAllByAltText(/logo/i);
    expect(logoImages.length).toBeGreaterThan(0);
  });

  test("renders the logout button", () => {
    mockUsePathname.mockReturnValue("/dashboard");
    render(<Sidebar />);

    const logoutButton = screen.getByRole("button", { name: /logout/i });
    expect(logoutButton).toBeInTheDocument();
  });
});
