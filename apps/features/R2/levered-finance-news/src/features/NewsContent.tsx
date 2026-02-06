import { useState, useEffect, useCallback, JSX } from 'react';
import parse from 'html-react-parser';
import { useSearchParams } from 'react-router-dom';
import { message } from 'antd';
import dayjs from 'dayjs';
import { requestNewsArticle } from '../lib/services';
import { INewsItem } from '../lib/types';
import styles from '../lib/styles.module.scss';
import { attachHandler } from '../utils/attach-handler';

export default function NewsContent() {
    const [isLoading, setIsLoading] = useState(false);
    const [articleId, setArticleId] = useState<number>(-1);
    const [newsItem, setNewsItem] = useState<INewsItem | null>();
    const [searchParams, setSearchParams] = useSearchParams();
    const [messageApi, contextHolder] = message.useMessage();

    // Function to fetch a news article by its ID
    const fetchArticle = useCallback((id: number) => {
        setIsLoading(true);

        if (!id) return;
        requestNewsArticle(id)
            .then((resp: { data: INewsItem }) => {
                setNewsItem(resp.data);
            })
            .catch(() => {
                messageApi.error('Something went wrong');
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    // Effect to fetch the article when the articleId changes
    useEffect(() => {
        if (articleId !== -1) {
            fetchArticle(articleId);
        } else {
            setNewsItem(null);
        }
    }, [articleId, fetchArticle]);

    const linkHandler = (e: Event, linkProps: { 'data-id': string; href: string }) => {
        if (linkProps.href.includes('articleId')) {
            e.preventDefault();
        }

        const params = new URLSearchParams();
        params.set('articleId', linkProps['data-id']);
        setSearchParams(params);
    };

    const Content = useCallback(() => {
        switch (true) {
            case isLoading:
                return (
                    <div className={styles['loading-container']}>
                        <div className={styles['spinner']} />
                    </div>
                );
            case !newsItem:
                return (
                    <div className={styles['article-card']}>
                        <h1 className={styles['article-content']}>
                            Please select an article on the left
                        </h1>
                    </div>
                );
            default: {
                const content = parse(newsItem?.articleBody ?? '') as JSX.Element[];
                const formatted = content.map((el) => attachHandler(el, linkHandler));
                return (
                    <div className={styles['article-card']}>
                        <h4 className={styles['article-publish-date']}>
                            {dayjs(newsItem?.publishDate).format('MMMM D, YYYY')}
                        </h4>
                        <div className={styles['article-header']}>
                            <div className={styles['article-info']}>
                                <h2 className={styles['article-card-title']}>{newsItem?.title}</h2>
                            </div>
                        </div>
                        <div className={styles['article-content']}>
                            {formatted}
                            Topics:
                            <br />
                            {newsItem?.topics.join(', ')}
                        </div>
                    </div>
                );
            }
        }
    }, [isLoading, newsItem]);

    useEffect(() => {
        const paramArticleId = searchParams?.get('articleId');
        setArticleId(!!paramArticleId?.trim() ? parseInt(paramArticleId, 10) : -1);
    }, [searchParams]);

    return (
        <main className={styles['content']}>
            <div className={styles['news-article']}>
                {contextHolder}
                <Content />
            </div>
        </main>
    );
}
