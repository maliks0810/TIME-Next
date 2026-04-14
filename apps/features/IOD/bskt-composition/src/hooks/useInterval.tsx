import { useEffect, useRef } from 'react'

type UseIntervalProps = <T, U>(
  callback: (vars?: U) => T,
  delay: number | null,
) => void;

export const useInterval: UseIntervalProps = (callback, delay) => {
  const callbackRef = useRef<typeof callback | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const tick = () => {
      if (callbackRef.current) {
        callbackRef.current();
      }
    };
    if (delay === null) {
      return;
    }
    let id = setInterval(tick, delay);
    return () => clearInterval(id);
  }, [delay]);
};