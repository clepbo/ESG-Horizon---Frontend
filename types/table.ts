export type TableRowType = {
  startingPeriod: string;
  endingPeriod: string;
  subsidiary: string;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
  id: string;
  status: "submitted" | "Awaiting Review" | "In Progress" | string;
};

export type TableFilters = {
  search: string;
  status: string;
  date: string;
};

export type ReportApiType = {
  id: number;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
  subsidiary: string;
  status: string;
};
