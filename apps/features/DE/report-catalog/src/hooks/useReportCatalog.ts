import { fetchReports } from '../services/catalog-service';
import { ReportCatalogFilters, ReportPage } from '../types/report.types';
import { InfiniteData, useInfiniteQuery } from '@tanstack/react-query';

const PAGE_SIZE = 50;

export function useReportCatalog(filters: ReportCatalogFilters) {
    return useInfiniteQuery<
        ReportPage,                           // queryFn return
        Error,                                // error
        InfiniteData<ReportPage>,                           // data
        [string, ReportCatalogFilters],       // queryKey
        number                                // pageParam
    >({
        queryKey: ['reportCatalog', filters],

        queryFn: ({ pageParam = 0, signal }) =>
            fetchReports(filters, PAGE_SIZE, pageParam, signal),

        initialPageParam: 0,

        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length < PAGE_SIZE) {
                return undefined;
            }
            return allPages.length * PAGE_SIZE;
        },

        staleTime: 5 * 60 * 1000,
        retry: 2,
        refetchOnWindowFocus: false
    });
}