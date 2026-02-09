import dayjs from 'dayjs';

export interface INewsStats {
    total: number,
    perPage: number,
    page: number,
    lastPage: number,
}

export interface INewsAuthor {
    authorName: string,
}

export interface INewsItem {
    articleId: number,
    title: string,
    authors: INewsAuthor[],
    regions: string[],
    publishDate: string,
    assetClasses: string[],
    topics: string[],
    issuer: {
        pbId: string,
        name: string,
    },
    lender: {
        pbId: string,
        name: string,
    },
    sponsor: {
        pbId: string,
        name: string,
    },
    deal?: string,
    articleBody?: string,
}

export type NewsListResponse = {
        items: INewsItem[],
        stats: INewsStats,
};

export type SearchParamsInterface = {
    dateRange?: dayjs.Dayjs[],
    page?: number | string,

};
