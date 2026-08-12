import { useEffect, useRef } from 'react';

interface InfiniteScrollOptions {
  rootRef: React.RefObject<HTMLElement | null>;
  hasNextPage?: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

export function useInfiniteScrollTrigger({
  rootRef,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage
}: InfiniteScrollOptions) {
  const loaderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    if (!hasNextPage) return;
    if (isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          fetchNextPage();
        }
      },
      {
        root: rootRef.current,      // ✅ critical
        rootMargin: '200px',        // ✅ prefetch earlier
        threshold: 0.01
      }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [rootRef, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return loaderRef;
}
