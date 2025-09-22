import { useQuery } from "@tanstack/react-query";
import { industriesService } from "../industries.services";

/**
 * Hook to fetch all sectors
 * @returns Same old same old
 */
export const useSectors = () => {
    return useQuery({
        queryKey: ["sectors"],
        queryFn: industriesService.getSectors,
    });
};

/**
 * Custom hook to fetch all industries.
 * @returns An object with `data`, `isLoading`, `error`, and more.
 */
export const useIndustries = () => {
    return useQuery({
        queryKey: ["industries"],
        queryFn: industriesService.getIndustries,
    });
};

/**
 * Custom hook to fetch industries by sector.
 * @param sector The sector to filter industries by.
 * @returns An object with `data`, `isLoading`, `error`, etc.
 */
export const useIndustriesBySector = (sector: string) => {
    return useQuery({
        queryKey: ["industries", sector],
        queryFn: () => industriesService.getIndustriesBySector(sector),
        enabled: !!sector,
    });
};
