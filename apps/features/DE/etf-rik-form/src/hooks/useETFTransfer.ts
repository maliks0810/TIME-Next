import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    fetchETFTransferRequests,
    fetchETFTransferRequestById,
    createETFTransferRequest,
    saveETFLineItems,
    submitETFTransferRequest,
    deleteETFTransferRequest,
    downloadETFTransferRequest,
    submitETFTransferOrder
} from "../api/etf-transfer";
import { AllocationOutputRow } from "../types/etfform";




// ✅ list
export const useETFTransferRequests = (email?: string, search?: string, status?: string) => {
    return useQuery({
        queryKey: ["etf-transfer-requests", email, search, status],
        queryFn: () => fetchETFTransferRequests(email, search, status)
    });
};


// ✅ get by id
export const useETFTransferRequest = (id: string) => {
    return useQuery({
        queryKey: ["etf-transfer-request", id],
        queryFn: () => fetchETFTransferRequestById(id),
        enabled: !!id,
        refetchInterval: (query) => {
            const status = query.state.data?.status
            return !["FAILED", "DRAFT", "TRANSFERRED", "COMPLETED"].includes(status ?? '')
                ? 5000
                : false;
        }

    });
};



// ✅ create
export const useCreateETFTransferRequest = () => {
    return useMutation({
        mutationFn: (email: string) => createETFTransferRequest(email)
    });
};


// ✅ save line items
export const useSaveETFLineItems = (requestId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (items: AllocationOutputRow[]) => saveETFLineItems(requestId, items),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["etf-transfer-request", requestId] });
        }
    });
};


// ✅ submit
export const useSubmitETFTransferRequest = (requestId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => submitETFTransferRequest(requestId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["etf-transfer-request", requestId] });
            queryClient.invalidateQueries({ queryKey: ["etf-transfer-requests"] });
        }
    });
};


export const useSubmitETFTransferOrder = (
    requestId: string
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: submitETFTransferOrder,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [
                    "etf-transfer-request",
                    requestId
                ]
            });
        }
    });
};

export const useDeleteETFTransferRequest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (requestId?: string) =>
            deleteETFTransferRequest(requestId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["etf-transfer-requests"] });
        }
    });
};


interface DownloadParams {
    id: string;
    mode: string;
}
export const useDownloadETFTransferRequest = () => {
    return useMutation({
        mutationFn: (params: DownloadParams) => downloadETFTransferRequest(params.id, params.mode),
    });
};
