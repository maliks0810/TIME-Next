import dayjs from 'dayjs';
import { SearchParamsInterface } from './types';

export const getSearchParams = ({ dateRange, page }: SearchParamsInterface) => {
    const params = new URLSearchParams();
    if (dateRange) {
        params.append('startDate', dateRange[0].format('YYYY-MM-DD'));
        params.append('endDate', dateRange[1].format('YYYY-MM-DD'));
    }
    if (page) {
        params.append('page', `${page}`);
    }

    return params.toString();
};

export const getCustomDateRange = (value: string) => {
    const now = dayjs();
    let startDate;
    let endDate;

    switch (value) {
        case 'last24hrs':
            startDate = now.subtract(24, 'hour');
            endDate = now;
            break;
        case 'last48hrs':
            startDate = now.subtract(48, 'hour');
            endDate = now;
            break;
        case 'lastWeek':
            startDate = now.subtract(7, 'day');
            endDate = now;
            break;
        default:
            startDate = null;
            endDate = null;
            break;
    }

    return startDate && endDate ? [startDate, endDate] : null;
};
