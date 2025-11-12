import { render, screen, within } from "@testing-library/react";
import ReportsAnalyticsPage from "@/app/(admin)/reports/page";
import "@testing-library/jest-dom";

// Mock dependent components
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    refresh: jest.fn(),
  }),
}));

jest.mock("../app/components/layout/Header", () => () => <div data-testid="header">Header</div>);
jest.mock("../app/components/reports/ExportAllButton", () => () => (
  <button data-testid="export-button">Export All</button>
));
jest.mock("../app/components/reports/ReportSummaryCard", () => ({
  ReportSummaryCard: ({ label }: { label: string }) => (
    <div data-testid="report-summary">{label}</div>
  ),
}));
jest.mock("../app/components/reports/LineChartCard", () => () => (
  <div data-testid="line-chart">Line Chart</div>
));
jest.mock("../app/components/reports/BarChartCard", () => () => (
  <div data-testid="bar-chart">Bar Chart</div>
));
jest.mock("../app/components/reports/ReportTab", () => ({
  ReportTabs: () => (
    <div data-testid="report-tabs">
      <button>All Reports</button>
      <button>Published</button>
    </div>
  ),
}));
jest.mock("../app/components/reports/ReportActivityTable", () => () => (
  <div data-testid="users-table">Users Table</div>
));

describe("ReportsAnalyticsPage", () => {
  it("renders the page heading and description", () => {
    render(<ReportsAnalyticsPage />);
    expect(screen.getByText("Reports & Analytics")).toBeInTheDocument();
    expect(
      screen.getByText("View and analyze ESG reports submitted by companies")
    ).toBeInTheDocument();
  });

  it("renders all summary cards", () => {
    render(<ReportsAnalyticsPage />);
    const summaries = screen.getAllByTestId("report-summary");

    expect(within(summaries[0]).getByText("Reports Generated")).toBeInTheDocument();
    expect(within(summaries[1]).getByText("Published")).toBeInTheDocument();
    expect(within(summaries[2]).getByText("Under Review")).toBeInTheDocument();
    expect(within(summaries[3]).getByText("Active Companies")).toBeInTheDocument();
  });

  it("renders charts", () => {
    render(<ReportsAnalyticsPage />);
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
  });

  it("renders the report tabs and users table", () => {
    render(<ReportsAnalyticsPage />);
    expect(screen.getByTestId("report-tabs")).toBeInTheDocument();
    expect(screen.getByTestId("users-table")).toBeInTheDocument();
  });

  it("renders export all button", () => {
    render(<ReportsAnalyticsPage />);
    expect(screen.getByTestId("export-button")).toBeInTheDocument();
  });
});
