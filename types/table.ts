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
