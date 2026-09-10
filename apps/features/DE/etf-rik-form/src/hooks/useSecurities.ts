import { SecuritiesResponse } from "../types/security";
import { fetchSecurities } from "../api/etf-transfer";
import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";

export const useInfiniteSecurities = (search?: string, portfolio?: string) => {
    return useInfiniteQuery<
        SecuritiesResponse,
        Error,
        InfiniteData<SecuritiesResponse>,
        [string, string | undefined, string | undefined],
        number
    >({
        queryKey: ["securities", search, portfolio],
        queryFn: fetchSecurities,
        initialPageParam: 1,
        // enabled: (search?.length ?? 0) > 1,
        getNextPageParam: (lastPage, allPages) => {
            const total = lastPage.total;
            const loaded = allPages
                .map((p) => p.data.length)
                .reduce((a, b) => a + b, 0);

            return loaded < total ? allPages.length + 1 : undefined;
        },
        staleTime: 0, // cache 5 min
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        retry: 1,
    })
}
