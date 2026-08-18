import { Block } from './types';
import { getAladdinIdWithinDaysRange } from './services';
import { Dispatch, SetStateAction, WheelEvent, KeyboardEvent, RefObject } from 'react';
import { MessageInstance } from 'antd/es/message/interface';

const COLLAPSIBLE_HEADERS = [
    'Assumptions Parameters Delta',
    'Analytics Parameters Delta',
    'Payload Configuration Snapshot',
    'Workflow Configuration Snapshot',
];

export function extractBlocks(text: string): {
    remainingText: string;
    blocks: Block[];
} {
    let remainingText = text;

    const blocks: Block[] = [];

    for (const header of COLLAPSIBLE_HEADERS) {
        const start = remainingText.indexOf(header);

        if (start === -1) {
            continue;
        }

        let nextStart = remainingText.length;

        for (const otherHeader of COLLAPSIBLE_HEADERS) {
            if (otherHeader === header) {
                continue;
            }

            const idx = remainingText.indexOf(
                otherHeader,
                start + header.length
            );

            if (idx !== -1 && idx < nextStart) {
                nextStart = idx;
            }
        }

        blocks.push({
            title: header,
            content: remainingText
                .substring(start + header.length, nextStart)
                .trim(),
        });

        remainingText =
            remainingText.substring(0, start).trim() +
            '\n' +
            remainingText.substring(nextStart).trim();
    }

    return {
        remainingText: remainingText.trim(),
        blocks,
    };
}

export function formatTimelineTime(timestamp?: string): string {
    if (!timestamp) {
        return '';
    }

    const date = new Date(timestamp);
    
    if (Number.isNaN(date.getTime())) {
        return timestamp;
    }

    return date.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
    });
}

export function formatTimelineDate(timestamp?: string): string {
    if (!timestamp) {
        return 'Unknown date';
    }

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
        return timestamp;
    }

    return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}


export const loadOptions = async (
    setLoading: Dispatch<SetStateAction<boolean>>,
    messageApi: MessageInstance,
): Promise<{
    day: string[];
    week: string[];
    month: string[];
}> => {
    try {
        setLoading(true);

        const [dayData, weekData, monthData] = await Promise.all([
            getAladdinIdWithinDaysRange(0, 1),
            getAladdinIdWithinDaysRange(1, 7),
            getAladdinIdWithinDaysRange(7, 30),
        ]);

        const dayIds = dayData.data ?? [];
        const weekIds = weekData.data ?? [];
        const monthIds = monthData.data ?? [];

        const oneDayIdsSet = new Set(dayIds)
        const filteredOneWeekIds = weekIds.filter(id => !oneDayIdsSet.has(id));
        const oneWeekIdsSet = new Set(filteredOneWeekIds);
        const filteredOneMonthIds = monthIds.filter(id => !oneDayIdsSet.has(id) && !oneWeekIdsSet.has(id));

        return({day: dayIds, week: filteredOneWeekIds, month: filteredOneMonthIds});
    } catch (err) {
        console.error(err);
        messageApi.error("Failed to get Asset IDs");
        return {day: [], week: [], month: []};
    } finally {
        setLoading(false);
    }
};

export const handleHorizontalScroll = (
    event: WheelEvent<HTMLDivElement>
) => {
    const container = event.currentTarget;

    // Keep all wheel movement inside the timeline region.
    event.preventDefault();
    event.stopPropagation();

    const scrollAmount =
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
            ? event.deltaX
            : event.deltaY;

    container.scrollLeft += scrollAmount;
};

export const renderValue = (value: unknown): string => {
    if (value === null || value === undefined || value === '') return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
};

export const checkIsChanged = (current: unknown, baseline: unknown): boolean => {
    return renderValue(current) !== renderValue(baseline);
};

export const formatLabel = (key: string): string => {
    const acronyms = new Set([
        'Krd', 'Wal', 'Oad', 'Oac', 'Oas', 'Oav', 'Zv', 'Ror', 'Br', 'Id'
    ]);

    const parts = key
        // split before capital letters
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        // split when letters transition to numbers
        .replace(/([a-zA-Z])(\d+)/g, '$1 $2')
        .split(' ');

    return parts
        .map((part, index) => {
            // first word: capitalize first letter only
            if (index === 0) {
                part = part.charAt(0).toUpperCase() + part.slice(1);
            }

            // known acronyms -> all caps
            if (acronyms.has(part)) {
                return part.toUpperCase();
            }

            return part;
        })
        .join(' ');
};

interface TimelineNavigationItem {
    mergedIndex: number;
}

interface HandleArrowNavigationParams {
    event: KeyboardEvent<HTMLButtonElement>;
    filteredIndex: number;
    filteredItems: TimelineNavigationItem[];
    selectItem: (mergedIndex: number) => void;
    itemRefs: RefObject<Record<number, HTMLButtonElement | null>> | {
        current: Record<number, HTMLButtonElement | null>;
    };
}

export const handleArrowNavigation = ({
    event,
    filteredIndex,
    filteredItems,
    selectItem,
    itemRefs,
}: HandleArrowNavigationParams): void => {
    if (
        event.key !== 'ArrowLeft' &&
        event.key !== 'ArrowRight'
    ) {
        return;
    }

    event.preventDefault();

    const direction =
        event.key === 'ArrowRight' ? 1 : -1;

    const nextFilteredIndex =
        filteredIndex + direction;

    if (
        nextFilteredIndex < 0 ||
        nextFilteredIndex >= filteredItems.length
    ) {
        return;
    }

    const nextItem =
        filteredItems[nextFilteredIndex];

    selectItem(nextItem.mergedIndex);

    itemRefs.current[
        nextItem.mergedIndex
    ]?.focus();
};