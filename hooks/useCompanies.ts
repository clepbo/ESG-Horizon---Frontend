"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllCompanies } from "@/lib/api/companyApi";
import { companyService } from "@/services/company.service";

export function useCompanies() {
  return useQuery({
    queryKey: ["companies"],
    queryFn: companyService.getAll,
  });
}
