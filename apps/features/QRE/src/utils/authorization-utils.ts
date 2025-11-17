import { AnyData } from "../types/model-catalog-types";
import { QreBulkAuthorizations } from "../types/qre-authorization-types";

export const ToQreBulkAuthorizations = (data: AnyData) : QreBulkAuthorizations | undefined => {
    return data as QreBulkAuthorizations;
}