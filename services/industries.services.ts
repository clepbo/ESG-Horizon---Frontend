import api from "@/lib/api/axios";

export interface Industry {
  id: number;
  name: string;
  sector: {
    id: number;
    name: string;
  };
}

export interface Sector {
  id: number;
  name: string;
}

export const industriesService = {
  getSectors: async (): Promise<Sector[]> => {
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
