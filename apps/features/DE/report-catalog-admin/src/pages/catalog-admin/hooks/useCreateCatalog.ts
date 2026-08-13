import { catalogAdminService } from "../../../services/catalog-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateCatalog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: catalogAdminService.createCatalog,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["catalog"],
      });
    },
  });
};