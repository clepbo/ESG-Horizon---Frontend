import api from "@/lib/api/axios";

export interface Industry {
  id: number;
  sector: string;
  industry: string;
}

export const industriesService = {
  getSectors: async (): Promise<string[]> => {
    const data = await api.get("/industries/sectors");
    return data;
  },

  getIndustries: async (): Promise<Industry[]> => {
    const data = await api.get("/industries");
    return data;
  },

  getIndustriesBySector: async (sector: string): Promise<Industry[]> => {
    const encodedSector = encodeURIComponent(sector);
    const data = await api.get(`/industries/sectors/${encodedSector}`);
    return data;
  },
};
