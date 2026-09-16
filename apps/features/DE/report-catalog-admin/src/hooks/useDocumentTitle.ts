// import { useEffect } from 'react';

// const DEFAULT_TITLE = 'TIME Platform';

// export const useDocumentTitle = (title: string) => {
//   useEffect(() => {
//     document.title = title;

//     return () => {
//       document.title = DEFAULT_TITLE;
//     };
//   }, [title]);
// };

import { useEffect } from 'react';

export const useDocumentTitle = (title: string) => {
  useEffect(() => {
    const originalTitle = document.title;

    document.title = title;

    return () => {
      document.title = originalTitle;
    };
  }, [title]);
};
