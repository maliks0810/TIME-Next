import { useState } from 'react';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import styles from '../lib/styles.module.scss';

type NewsPaginationProps = {
    lastPage?: number;
    onChange: (page: number) => void;
};

function PaginationDivider() {
    return <div className={styles['pagination-divider']}>...</div>;
}

const getPageList = ({ currentPage, lastPage }: { currentPage: number; lastPage: number }) => {
    if (lastPage < 8) {
        return new Array(lastPage).fill(1).map((_, index) => index + 1);
    }
    if (currentPage < 5) {
        return [1, 2, 3, 4, 5, '...', lastPage];
    }
    if (currentPage < lastPage - 2) {
        return new Array(7).fill(1).map((item, index) => {
            switch (true) {
                case index === 0:
                    return 1;
                case index === 1:
                    return '...';
                case index === 2:
                    return currentPage - 1;
                case index === 3:
                    return currentPage;
                case index === 4:
                    return currentPage + 1;
                case index === 5:
                    return '...';
                case index === 6:
                    return lastPage;
                default:
                    return item;
            }
        });
    }

    return [1, '...', lastPage - 4, lastPage - 3, lastPage - 2, lastPage - 1, lastPage];
};

export default function NewsPagination({ lastPage = 10, onChange }: NewsPaginationProps) {
    const [currentPage, setCurrentPage] = useState(1);

    const handleChangePage = (page: number) => () => {
        if (onChange) {
            onChange(page);
        }
        setCurrentPage(page);
    };

    const handleClickPrevPage = () => {
        const page = currentPage - 1;
        if (onChange) {
            onChange(page);
        }
        setCurrentPage(page);
    };

    const handleClickNextPage = () => {
        const page = currentPage + 1;
        if (onChange) {
            onChange(page);
        }
        setCurrentPage(page);
    };

    return lastPage > 1 ? (
        <div className={styles['pagination-container']}>
            <button
                type="button"
                className={styles['pagination-button']}
                disabled={currentPage === 1}
                onClick={handleClickPrevPage}
            >
                <LeftOutlined />
            </button>
            {getPageList({ currentPage, lastPage }).map((item, index) =>
                item === '...' ? (
                    <PaginationDivider key={`divider-${index}`} />
                ) : (
                    <button
                        type="button"
                        className={
                            item === currentPage
                                ? styles['pagination-button-active']
                                : styles['pagination-button']
                        }
                        key={item}
                        onClick={handleChangePage(item as number)}
                    >
                        {item}
                    </button>
                )
            )}
            <button
                type="button"
                className={styles['pagination-button']}
                disabled={currentPage === lastPage}
                onClick={handleClickNextPage}
            >
                <RightOutlined />
            </button>
        </div>
    ) : null;
}
