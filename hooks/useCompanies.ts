"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllCompanies } from "@/lib/api/companyApi";

export function useCompanies() {
  return useQuery({
    queryKey: ["companies"],
    queryFn: getAllCompanies,
  });
}
