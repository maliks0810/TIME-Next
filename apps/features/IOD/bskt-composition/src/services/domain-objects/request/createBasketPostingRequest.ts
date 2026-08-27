// Match the backend BasketNegotiationOverrides class
interface BasketNegotiationOverrides {
    basketNegotiationOverrideId?: number;
    basketNegotiationId?: number;
    cashFeeOverrideValue?: number | null;
    createdBy?: string;
    createdDate?: string;
    modifiedBy?: string;
    modifiedDate?: string;
};

// Match the backend CreateBasketPostingRequest class
export interface CreateBasketPostingRequest {
    basketNegotiationId: number;
    overrides?: BasketNegotiationOverrides;
    createdBy: string;
};