import { useEffect, useState } from 'react';

export const usePageVisibilityChange = () => {
  const [isVisible, setIsVisible] = useState<boolean>(!document.hidden);

  useEffect(() => {
    const handlePageVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handlePageVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handlePageVisibilityChange);
    };
  }, []);

  return isVisible;
};