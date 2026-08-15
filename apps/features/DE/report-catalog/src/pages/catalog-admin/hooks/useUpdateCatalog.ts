import { catalogAdminService } from "../../../services/catalog-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UpdateCatalogRequest } from "../types/catalog";

export const useUpdateCatalog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateCatalogRequest;
    }) =>
      catalogAdminService.updateCatalog(
        id,
        payload
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["catalog"],
      });
    },
  });
};