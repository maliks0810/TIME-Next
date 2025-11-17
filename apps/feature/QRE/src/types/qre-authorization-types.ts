export type QreAuthStatus = {
    resource: string;
    action: string;
    authorized: boolean;
};
export type QreBulkAuthorizations = {
    totalCount: number;
    results?: QreAuthStatus[];
};
