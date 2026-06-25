export type SearchResult = {
    key: string;
    name: string;
    cusip: string;
    isin: string;
    aladdinId: string;
    figi: string;
    assetType: string;
    context: Record<string, string>;
};

export type RecentSearch = {
    name: string;
    cusip: string;
    isin: string;
    assetType: string;
    collateralType: string;
    context: Record<string, string>;
};
export type SearchType = 'CUSIP' | 'ISIN' | 'TICKER' | 'FIGI';
