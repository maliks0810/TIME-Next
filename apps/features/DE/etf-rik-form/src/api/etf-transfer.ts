import axios from "axios";
import { BASE_URL } from "./endpoints";
import { AllocationOutputRow } from "../types/etfform";
import { QueryFunctionContext } from "@tanstack/react-query";
import { ETFTransferRequest } from "../types/response";

const API = `${BASE_URL}/etf/etf-transfer-requests`;

const API_ETF_BASE = `${BASE_URL}/etf`;

// ✅ list
export const fetchETFTransferRequests = async (email?: string, search?: string, status?: string) => {
    const res = await axios.get(API, {
        params: { email, search, status }
    });
    return res.data;
};

// ✅ get by id
export const fetchETFTransferRequestById = async (id: string): Promise<ETFTransferRequest> => {
    const res = await axios.get(`${API}/${id}`);
    return res.data;
};

// ✅ create
export const createETFTransferRequest = async (created_by: string) => {
    const res = await axios.post(API, { created_by });
    return res.data;
};

// ✅ save line items
export const saveETFLineItems = async (requestId: string, items: AllocationOutputRow[]) => {
    const res = await axios.post(
        `${API}/${requestId}/orders/save`,
        { items }
    );
    return res.data;
};

// ✅ submit
export const submitETFTransferRequest = async (requestId: string) => {
    const res = await axios.post(`${API}/${requestId}/submit`);
    return res.data;
};

export const submitETFTransferOrder = async (
    orderId: string
) => {
    const res = await axios.post(
        `${API}/orders/${orderId}/submit`
    );

    return res.data;
};

export const deleteETFTransferRequest = async (requestId?: string) => {
    const res = await axios.delete(`${API}/${requestId}`);
    return res.data;
};


export const fetchSecurities = async ({ pageParam = 1, queryKey }: QueryFunctionContext<[string, string | undefined, string | undefined], number>) => {
    const [, search, portfolio] = queryKey;
    const res = await axios.get(`${API_ETF_BASE}/securities`, {
        params: {
            search: search || null,
            portfolio: portfolio || null,
            page: pageParam,
            page_size: 20,
        },
    });

    return res.data;
};


export const downloadETFTransferRequest = async (
    id: string,
    mode: string = 'order'
): Promise<void> => {
    const response = await axios.get(
        `${API}/${id}/download`,
        {
            responseType: "blob",
            params: { "mode": mode }
        },
    );

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    const contentDisposition =
        response.headers["content-disposition"];
    let fileName = `ETF_${id}.csv`;
    if (contentDisposition) {
        const match = contentDisposition.match(/filename="?(.+?)"?$/);
        if (match?.[1]) {
            fileName = match[1];
        }
    }
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
};
