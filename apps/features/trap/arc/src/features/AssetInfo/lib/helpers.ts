import { normalizeStatus } from '../../../lib/helpers';
import { STATUSES_ENUM } from '../../../lib/constants';

export const parseDate = (dateString?: string): Date => {
    if (dateString?.includes('T')) {
        return new Date(dateString);
    }

    const dateTimeWOTimeZone = dateString
        ?.trim()
        .trim()
        .replace(/\s+[\+\-]\d{2}:\d{2}$/, '');

    return new Date(dateTimeWOTimeZone + ' UTC');
};

const formatToPST = (date: Date): string => {
    const pstOptions: Intl.DateTimeFormatOptions = {
        timeZone: 'America/Los_Angeles',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    };

    const formatter = new Intl.DateTimeFormat('en-US', pstOptions);
    const parts = formatter.formatToParts(date);

    const day = parts.find((p) => p.type === 'day')?.value;
    const month = parts.find((p) => p.type === 'month')?.value;
    const year = parts.find((p) => p.type === 'year')?.value;
    const hour = parts.find((p) => p.type === 'hour')?.value;
    const minute = parts.find((p) => p.type === 'minute')?.value;

    return `${month}/${day}/${year} ${hour}:${minute} PST`;
};

export const convertDateToPST = (dateString = ''): string => {
    if (dateString === '') {
        return dateString;
    }
    if (!dateString || typeof dateString !== 'string') {
        throw new Error('Invalid date string provided');
    }

    const date = parseDate(dateString);

    if (isNaN(date.getTime())) {
        throw new Error(`Unable to parse date: ${dateString}`);
    }

    return formatToPST(date);
};

export const getElapsed = (date: Date) => {
    const diffMs = Date.now() - date.getTime();

    const totalSeconds = Math.floor(diffMs / 1000);
    const seconds = totalSeconds % 60;
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const hours = Math.floor(totalSeconds / 3600);

    const pad = (n: number) => String(n).padStart(2, '0');

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

export const getNextAction = (currentStatus?: string) => {
    switch (currentStatus) {
        case normalizeStatus(STATUSES_ENUM.INPUT_PENDING_REVIEW):
            return 'Publish Analytics Input';
        case normalizeStatus(STATUSES_ENUM.INPUT_SENT_TO_ALADDIN):
            return 'Run Analytics';
        case normalizeStatus(STATUSES_ENUM.ANALYTICS_PENDING_REVIEW):
            return 'Publish Analytics';
        case normalizeStatus(STATUSES_ENUM.ANALYTICS_SENT_TO_ALADDIN):
            return 'Publish Analytics to TDC';
        default:
            return 'No Action Required';
    }
};

export const getNextStatus = (currentStatus?: string) => {
    switch (currentStatus) {
        case normalizeStatus(STATUSES_ENUM.INPUT_PENDING_REVIEW):
            return STATUSES_ENUM.INPUT_SENT_TO_ALADDIN;
        case normalizeStatus(STATUSES_ENUM.INPUT_SENT_TO_ALADDIN):
            return STATUSES_ENUM.CALCUALTION_IN_PROGRESS;
        case normalizeStatus(STATUSES_ENUM.CALCUALTION_IN_PROGRESS):
            return STATUSES_ENUM.ANALYTICS_PENDING_REVIEW;
        case normalizeStatus(STATUSES_ENUM.ANALYTICS_PENDING_REVIEW):
            return STATUSES_ENUM.ANALYTICS_SENT_TO_ALADDIN;
        case normalizeStatus(STATUSES_ENUM.ANALYTICS_SENT_TO_ALADDIN):
            return STATUSES_ENUM.ANALYTICS_VERIFIED_IN_ALADDIN;
        default:
            return '---';
    }
};
