import { catalogAdminService } from "../../../services/catalog-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useDeleteCatalog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: catalogAdminService.deactivateCatalog,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["catalog"],
      });
    },
  });
};