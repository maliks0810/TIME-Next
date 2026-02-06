import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { message } from 'antd';
import { NewsListResponse } from '../lib/types';
import styles from '../lib/styles.module.scss';
import { requestNewsListWithParams } from '../lib/services';
import NewsPagination from './NewsPagination';

export default function NewsSidebar() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [currentPage, setCurrentPage] = useState(1);
    const [newsListResponse, setNewsListResponse] = useState<NewsListResponse>();
    const [isLoadingList, setIsLoadingList] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();

    const handleArticleClick = (navArticleId: number) => {
        const articleSearchParams = new URLSearchParams(searchParams.toString());
        articleSearchParams.set('articleId', navArticleId.toString());
        setSearchParams(articleSearchParams);
    };

    // Reverted useEffects to separate calls because it broke pagination.
    useEffect(() => {
        const pageParam = searchParams.get('page');
        const pageNumber = pageParam ? Number(pageParam) : 1;
        if (pageNumber !== currentPage) {
            setCurrentPage(pageNumber);
        }
    }, [searchParams.get('page')]);

    useEffect(() => {
        const pageParam = searchParams.get('page');
        if (String(currentPage) !== pageParam) {
            const newSearchParams = new URLSearchParams(searchParams.toString());
            if (currentPage === 1) {
                newSearchParams.delete('page');
            } else {
                newSearchParams.set('page', currentPage.toString());
            }
            setSearchParams(newSearchParams);
        }
    }, [currentPage]);

    useEffect(() => {
        const fetchNewsList = async () => {
            setIsLoadingList(true);
            try {
                const paramsForApi = new URLSearchParams(searchParams.toString());
                paramsForApi.delete('articleId');

                const response = await requestNewsListWithParams(paramsForApi.toString());
                setNewsListResponse(response.data);
                /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
            } catch (error: any) {
                const status = error?.response?.status;

                if (status === 404) {
                    if (
                        error?.response?.data?.error ===
                        '{"reason":"NOT_FOUND","message":"No articles were found for the specified criteria"}'
                    ) {
                        messageApi.info('Search did not return any results');
                        setNewsListResponse({
                            items: [],
                            stats: { total: 0, perPage: 0, page: 0, lastPage: 0 },
                        });
                    } else {
                        messageApi.error('Search returned an error, please try different filters');
                    }
                } else {
                    const message =
                        error?.response?.data?.message ||
                        error?.message ||
                        'An unknown error occurred';
                    messageApi.error(message);
                }
            } finally {
                setIsLoadingList(false);
            }
        };

        fetchNewsList();
    }, [
        searchParams.get('page'),
        searchParams.get('startDate'),
        searchParams.get('endDate'),
        searchParams.get('assetClasses'),
        searchParams.get('regions'),
        searchParams.get('topics'),
        searchParams.get('authors'),
    ]);

    return (
        <aside className={styles['sidebar']}>
            <div className={styles['sidebar-header']}>
                <span className={styles['sidebar-title']}>News Articles</span>
            </div>
            {contextHolder}

            {isLoadingList ? (
                <div className={styles['loading-container']}>
                    <div className={styles['spinner']} />
                </div>
            ) : (
                <div className={styles['article-list']}>
                    {newsListResponse?.items.map((newsListItem) => (
                        <div
                            key={newsListItem?.articleId}
                            onClick={() => handleArticleClick(newsListItem?.articleId)}
                            className={`${styles['article-item']} ${
                                searchParams?.get('articleId') === String(newsListItem?.articleId)
                                    ? styles['selected']
                                    : ''
                            }`}
                        >
                            <div className={styles['article-title']}>{newsListItem?.title}</div>
                        </div>
                    ))}
                </div>
            )}
            <NewsPagination lastPage={newsListResponse?.stats.lastPage} onChange={setCurrentPage} />
        </aside>
    );
}
