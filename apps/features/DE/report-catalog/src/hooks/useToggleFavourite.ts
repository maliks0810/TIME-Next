import { addFavourite, removeFavourite } from '../services/user-service';
import { useMutation, useQueryClient, InfiniteData } from '@tanstack/react-query';
import { Report, ReportCatalogFilters, ReportPage } from '../types/report.types'

export function useToggleFavourite(userEmail: string, filters: ReportCatalogFilters) {
    const queryClient = useQueryClient();
    const queryKey = ['reportCatalog', filters];

    return useMutation({
        mutationFn: async (report: Report) => {
            if (report.isuserfavourite) {
                await removeFavourite(report.reportnum, userEmail);
            } else {
                await addFavourite({
                    reportnum: report.reportnum,
                    departmentname: report.departmentname,
                    UserEmail: userEmail
                });
            }
        },

        // ✅ OPTIMISTIC UPDATE
        onMutate: async (report: Report) => {
            await queryClient.cancelQueries({ queryKey });

            const previousData =
                queryClient.getQueryData<InfiniteData<ReportPage>>(queryKey);

            queryClient.setQueryData<InfiniteData<ReportPage>>(queryKey, old => {
                if (!old) return old;

                return {
                    ...old,
                    pages: old.pages.map(page =>
                        page.map(r =>
                            r.reportnum === report.reportnum
                                ? { ...r, isuserfavourite: !r.isuserfavourite }
                                : r
                        )
                    )
                };
            });

            return { previousData };
        },

        // ✅ ROLLBACK ON ERROR
        onError: (_err, _report, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(queryKey, context.previousData);
            }
        },

        // ✅ ENSURE SERVER SYNC
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey });
        }
    });
}