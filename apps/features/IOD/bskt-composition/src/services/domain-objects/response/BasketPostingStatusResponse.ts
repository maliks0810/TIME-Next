export interface BasketPostingStatusResponse {
    basketsAllPublishedFlag: number;
    basketsPostStatusDetails: BasketPostStatusDetailResponse[];

}

export interface BasketPostStatusDetailResponse {
    trackingId: string;
    basketStatus: string;
    basketStatusCode: string;
}