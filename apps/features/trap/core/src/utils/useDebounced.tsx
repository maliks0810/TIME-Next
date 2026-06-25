import { useEffect, useState } from 'react';

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const useDebounced = (value: any, delayMs = 300) => {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delayMs);
        return () => clearTimeout(t);
    }, [value, delayMs]);

    return debounced;
};
