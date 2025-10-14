import apiUtil from "@/lib/api/axios";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

// export const getReport = async () => {
//   const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
//   console.log("URL", baseUrl);
//   try {
//     const res = await apiUtil.get(`${baseUrl}report`, {
//       method: "GET",
//       headers:{
//         'Content-Type': 'application/json',
//       }
//     });
//     if (!res.ok) {
//       throw new Error(`Failed to fetch report: ${res.status}`);
//     }
//     return res.json();
//   } catch (error) {
//     console.error("Error fetching report:", error);
//     throw error;
//   }
// };


export async function getReportOverview(){
    try {
        return await apiUtil.get(`${baseUrl}/report`)
    }
    catch(error){
        console.log(error)
        throw new Error(`${error}`)
    }
   
}


export async function getReport(id:number){
 try {
        return await apiUtil.get(`${baseUrl}/report/${id}`)
    }
    catch(error){
        console.log(error)
        throw new Error(`${error}`)
    }
}


