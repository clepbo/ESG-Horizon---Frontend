import { subsidiariesService } from "@/services/subsidiaries.service";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

export function useDeleteSubsidiary(remove: (id: number) => void) {
  return useMutation({
    mutationFn: (id: number) => subsidiariesService.deleteSubsidiaries(id),

    onSuccess: (_data, id) => {
      toast.success("Subsidiary deleted successfully");
      remove(id); // pass the same id used in mutate
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Delete failed");
    },
  });
}
