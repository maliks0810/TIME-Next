import { useQuery } from "@tanstack/react-query";
import { catalogAdminService } from "../../../services/catalog-service";
import { CatalogQueryParams } from "../types/catalog";
export const useCatalog = ({
    search,
    page,
    pageSize,
    email,
    status
}: CatalogQueryParams) => {
    return useQuery({
        queryKey: [
            "catalog",
            search,
            page,
            pageSize,
            status
        ],

        queryFn: async () => {
            const offset = page * pageSize;

            const response =
                await catalogAdminService.getCatalogs({
                    user_email: email,
                    search,
                    limit: pageSize,
                    offset,
                    status
                });

            return response.data;
        },
    });
};