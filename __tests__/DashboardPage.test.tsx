import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import DashboardPage from "@/app/(dashboard)/dashboard/page";

// Mock lucide-react icons and child components used in Dashboard
jest.mock("lucide-react", () => ({
  Building: () => <svg data-testid="icon-building" />,
  Scale: () => <svg data-testid="icon-scale" />,
  DollarSign: () => <svg data-testid="icon-dollar" />,
  ShieldUser: () => <svg data-testid="icon-shield-user" />,
}));

jest.mock("../app/components/layout/Header", () => () => (
  <div data-testid="header">Header</div>
));

jest.mock("../app/components/dashboard/StatCard", () => ({
  __esModule: true,
  default: ({ label, value }: { label: string; value: number }) => (
    <div data-testid="stat-card">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  ),
}));

jest.mock("../app/components/dashboard/UserPieChart", () => () => (
  <div data-testid="user-pie-chart">User Pie Chart</div>
));

jest.mock("../app/components/dashboard/RecentActivities", () => ({
  RecentActivities: () => (
    <div data-testid="recent-activities">Recent Activities</div>
  ),
}));

jest.mock("../app/components/dashboard/MostRecentUser", () => () => (
  <div data-testid="recent-users">Most Recent Users</div>
));

describe("DashboardPage", () => {
  beforeEach(() => {
    render(<DashboardPage />);
  });

  it("renders the header", () => {
    expect(screen.getByTestId("header")).toBeInTheDocument();
  });

  it("renders all 4 StatCards with correct labels", () => {
    const cards = screen.getAllByTestId("stat-card");
    expect(cards).toHaveLength(4);
    expect(screen.getByText(/Admins/i)).toBeInTheDocument();
    expect(screen.getByText(/ESG Company/i)).toBeInTheDocument();
    expect(screen.getByText(/Regulators/i)).toBeInTheDocument();
    expect(screen.getByText(/Investors/i)).toBeInTheDocument();
  });

  it("renders the user pie chart", () => {
    expect(screen.getByTestId("user-pie-chart")).toBeInTheDocument();
  });

  it("renders recent activities", () => {
    expect(screen.getByTestId("recent-activities")).toBeInTheDocument();
  });

  it("renders most recent users table", () => {
    expect(screen.getByTestId("recent-users")).toBeInTheDocument();
  });
});
