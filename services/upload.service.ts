import api from "@/lib/api/axios";

export interface UploadResponse {
  publicId: string;
  url: string;
}

export const uploadService = {
  async uploadImage(images: File): Promise<UploadResponse> {
    const formData = new FormData();

    formData.append("file", images);
    try {
      const { data } = await api.post("/upload/file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // The backend returns a data object within the response
      // so you should return data.data to match the UploadResponse interface
      return data as UploadResponse;
    } catch (err: any) {
      console.error("Upload failed:", err.response?.data || err.message);
      throw err;
    }
  },
};
