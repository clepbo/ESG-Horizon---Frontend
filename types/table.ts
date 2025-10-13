export type TableRowType = {
  startingPeriod: string;
  endingPeriod: string;
  subsidiaries: string;
  status: "Working on it" | "Awaiting Review" | "In Progress" | string;
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
