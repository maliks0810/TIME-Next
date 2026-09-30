import { useEffect } from 'react';
import DqMonitorPage from './pages/DqMonitorPage';
import { CurrentUserProvider } from './hooks/use-current-dm-user';
import { useUserInfo } from '@platform/utils';
// Copied verbatim from tcw-dqm/public/favicon.ico so the browser tab
// icon in TIME-Next matches the standalone DQM app once the operator
// clicks into it. `?url` gives us the resolved (hashed) asset URL
// Vite emits — safe across the standalone dev server and the shell-
// mounted production build.
import dqmFaviconUrl from './assets/favicon.ico?url';
/* your feature app root */
/*.dqm-root {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}
*/
// App.tsx
export default function App() {
    const userInfo = useUserInfo();

    // Shell opens internal apps in a fresh browser tab, so the tab
    // heading + favicon are whatever the shell rendered at open time.
    // Rewrite both here on mount so the new tab reads "DQM" and
    // shows the tcw-dqm favicon, and restore the previous values on
    // unmount so navigating back to another shell app doesn't leave
    // DQM behind. Same document.title pattern the IOD/tdm App.tsx
    // uses for "Security Setup".
    useEffect(() => {
        const originalTitle = document.title;
        document.title = 'DQM';

        // Find (or create) a <link rel="icon"> in the shell's <head>
        // and swap its href. Reuse the existing element if present so
        // we don't leave a stray icon link behind; if the shell had
        // none, create one and remove it on cleanup.
        const existingIcon = document.head.querySelector(
            'link[rel="icon"]',
        ) as HTMLLinkElement | null;
        const iconLink =
            existingIcon ??
            (document.head.appendChild(
                document.createElement('link'),
            ) as HTMLLinkElement);
        const createdIcon = existingIcon === null;
        if (createdIcon) iconLink.rel = 'icon';
        const originalIconHref = iconLink.getAttribute('href');
        const originalIconType = iconLink.getAttribute('type');
        iconLink.setAttribute('type', 'image/x-icon');
        iconLink.href = dqmFaviconUrl;

        return () => {
            document.title = originalTitle;
            if (createdIcon) {
                iconLink.remove();
            } else {
                if (originalIconHref === null) {
                    iconLink.removeAttribute('href');
                } else {
                    iconLink.href = originalIconHref;
                }
                if (originalIconType === null) {
                    iconLink.removeAttribute('type');
                } else {
                    iconLink.setAttribute('type', originalIconType);
                }
            }
        };
    }, []);

  return (
    <div style={{ width: "100%", paddingTop: "5px", paddingBottom: "10px",  paddingLeft: "0px",paddingRight: "0px",
          display: "flex", flexDirection: "column", flex: "1 1 auto", minHeight: 0 }}>
      <CurrentUserProvider value={userInfo?.name ?? ""}>
      <DqMonitorPage/>
      </CurrentUserProvider>
    </div>
  );
}

