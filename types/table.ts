export type TableRowType = {
  startingPeriod?: string;
  endingPeriod?: string;
  subsidiary: string;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
  id: string | number;
  status: "submitted" | "Awaiting Review" | "In Progress" | string;
  progress?: number;
  completed_sections?: number;
  total_sections?: number;
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
