import React from "react";

/**
 * Live content-box width (px) of a DOM node via ResizeObserver.
 * Uses a CALLBACK ref so it attaches correctly even when the target
 * mounts later (e.g. behind a `ready`/`showEmpty` gate). Rounds to whole
 * px to avoid sub-pixel re-render thrash.
 */
export function useElementWidth<T extends HTMLElement>() {
    const [width, setWidth] = React.useState(0);
    const roRef = React.useRef<ResizeObserver | null>(null);

    const ref = React.useCallback((node: T | null) => {
        // Tear down any previous observer (node swap or unmount).
        roRef.current?.disconnect();
        roRef.current = null;
        if (!node) return;

        // Seed immediately so the first paint after mount is correct.
        setWidth(Math.round(node.getBoundingClientRect().width));

        const ro = new ResizeObserver((entries) => {
            const w = entries[0]?.contentRect?.width ?? 0; // content box: excludes border + padding
            setWidth(Math.round(w));
        });
        ro.observe(node);
        roRef.current = ro;
    }, []);

    return [ref, width] as const;
}