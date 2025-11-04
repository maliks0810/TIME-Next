import { QreBulkAuthorizations } from "../types/qre-authorization-types";

export const ToQreBulkAuthorizations = (data: any) : QreBulkAuthorizations | undefined => {
    return data as QreBulkAuthorizations;
}