// hooks/useDepartments.ts

import { catalogAdminService } from "../../../services/catalog-service";
import { useQuery } from "@tanstack/react-query";

const getDepartments = async () => {
    const { data } = await catalogAdminService.getDepartments()

    return data.map((department: string) => ({
        label: department,
        value: department,
    }));
};

export const useDepartments = () => {
    return useQuery({
        queryKey: ["departments"],
        queryFn: getDepartments,
        staleTime: 0
    });
};