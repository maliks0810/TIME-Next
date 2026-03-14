import { useEffect, useRef, useState } from 'react';

const newNotificationTitle = 'New Notification!';
const originalTitle = document.title;

type RequestAttentionOptions = {
  message?: string;
  // Where to send the user when they click the notification
  url?: string;
  // If you want SPA navigation without full reload, provide a callback
  onNavigate?: () => void;
};

export function useRequestUserAttention() {
  const [isVisible, setIsVisible] = useState(!document.hidden);
  const [isFocused, setIsFocused] = useState(document.hasFocus());

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const blinkIntervalRef = useRef<any>(null);

  // Track tab activity
  useEffect(() => {
    const handleVisibilityChange = () => setIsVisible(!document.hidden);
    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Remove blinking Tab Title on page focus
  useEffect(() => {
    if (isFocused) {
      document.title = originalTitle;

      if (blinkIntervalRef.current) {
        clearInterval(blinkIntervalRef.current);
      }
    }
  }, [isFocused]);

  const startBlinkingTitle = () => {
    document.title = newNotificationTitle;

    if (blinkIntervalRef.current) clearInterval(blinkIntervalRef.current);

    blinkIntervalRef.current = setInterval(() => {
      document.title =
        document.title === newNotificationTitle ? originalTitle : newNotificationTitle;
    }, 1000);
  };

  const stopBlinkingTitle = () => {
    document.title = originalTitle;
    if (blinkIntervalRef.current) clearInterval(blinkIntervalRef.current);
  };

  // Function to show a notification (called when a message is received via SignalR)
  const requestUserAttention = ({
    message = 'Asset Analytics Calculated',
    url,
    onNavigate
  }: RequestAttentionOptions = {}) => {
    startBlinkingTitle();

    if (Notification.permission === 'granted') {
      const n = new Notification('ARC - New Notification', {
        body: message,
        // optional: helps some OSes group notifications
        tag: 'asset-analytics'
      });

      n.onclick = (event) => {
        event.preventDefault();

        // Ensure our tab comes to front if it exists
        window.focus();

        // Stop blinking once they engaged
        stopBlinkingTitle();

        // Prefer SPA navigation if provided
        if (onNavigate) {
          onNavigate();
          n.close();
          return;
        }

        // Otherwise fall back to hard navigation / open page
        if (url) {
          // Open in same tab (if you prefer), or open a new one:
          // window.location.assign(url);
          window.location.replace(url);
        }
        n.close();
     };
    }
  };

  return { shouldNotify: !isFocused || !isVisible, requestUserAttention };
}