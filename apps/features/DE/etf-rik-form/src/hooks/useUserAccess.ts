// src/hooks/useUserAccess.ts

import { getUserAccess, UserAccess } from "../api/auth";
import { useQuery } from "@tanstack/react-query";


export const useUserAccess = () => {
    return useQuery<UserAccess>({
        queryKey: ["user-access"],
        queryFn: getUserAccess,
        staleTime: 0, // 15 minutes
    });
};