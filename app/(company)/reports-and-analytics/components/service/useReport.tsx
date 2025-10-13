// import { useQuery } from "@tanstack/react-query";
// import apiUtil from "@/lib/api/axios";

// export function useReport() {
//   return useQuery({
//     queryKey: ["report"],
//     queryFn: async () => {
//       try {
//         const data = await apiUtil.get("/report");
//         return data; // already the actual response body
//       } catch (error) {
//         console.error("Error fetching report:", error);
//         throw error;
//       }
//     },
//     retry: 1, 
//     refetchOnWindowFocus: false,
//   });
// }
