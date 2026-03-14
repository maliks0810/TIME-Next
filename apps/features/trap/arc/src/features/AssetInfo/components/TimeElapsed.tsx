import { useEffect, useState } from 'react';
import { getElapsed, parseDate } from '../lib/helpers';

export function TimeElapsed({
    initialDate,
    title,
    selectedAssetId,
}: {
    initialDate?: string;
    title: string;
    selectedAssetId?: number | null;
}) {
    const date = parseDate(initialDate);
    const [elapsedTime, setElapsedTime] = useState(getElapsed(date));

    useEffect(() => {
        setElapsedTime(getElapsed(date));

        const interval = setInterval(() => {
            setElapsedTime(getElapsed(date));
        }, 1000);

        return () => clearInterval(interval);
    }, [selectedAssetId, initialDate]);

    return (
        <div style={{ marginBottom: 8 }}>
            <div style={{ minHeight: 20, fontSize: 13 }}>{initialDate ? elapsedTime : '---'}</div>
            <div style={{ fontSize: 9 }}>{title}</div>
        </div>
    );
}
