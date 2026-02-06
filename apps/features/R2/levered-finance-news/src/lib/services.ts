import axios from 'axios';

const DEFAULT_CONTENT_TYPE = 'application/json';
const DEFAULT_TIMEOUT = 120000; // 2 min
export const generateUUID = (): string => crypto.randomUUID();

export const serviceRequest =
    (
        baseURL: string,
        contentType: string = DEFAULT_CONTENT_TYPE,
        timeout: number = DEFAULT_TIMEOUT
    ) =>
    () =>
        axios.create({
            baseURL,
            timeout,
            headers: {
                'Content-Type': contentType,
                'X-Correlation-ID': generateUUID(),
            },
        });

const BASE_SERVICE_PATH = import.meta.env.VITE_APP_CREDIT_NEWS_BASE_SERVICE_PATH;
const URL_NEWS_ARTICLE = BASE_SERVICE_PATH + '/news-article';
const URL_NEWS_SEARCH = BASE_SERVICE_PATH + '/search';
const URL_FILTER_DATA = BASE_SERVICE_PATH + '/search-filters';

export const requestNewsListWithParams = (searchParams: string) =>
    serviceRequest(`${URL_NEWS_SEARCH}?${searchParams}`)().get('');

export const requestNewsArticle = (articleId: number) =>
    serviceRequest(URL_NEWS_ARTICLE)().get(`/${articleId}`);

export const requestFilterData = () => serviceRequest(URL_FILTER_DATA)().get('');
