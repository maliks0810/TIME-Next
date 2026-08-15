// src/hooks/useUserAccess.ts

import { getUserAccess, UserAccess } from "../services/auth";
import { useQuery } from "@tanstack/react-query";


export const useUserAccess = () => {
    return useQuery<UserAccess>({
        queryKey: ["user-access"],
        queryFn: getUserAccess,
        staleTime: 0, // 15 minutes
    });
};