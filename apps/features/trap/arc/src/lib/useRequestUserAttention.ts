import { useEffect, useRef, useState } from 'react';

const newNotificationTitle = 'New Notification!';
const originalTitle = document.title;

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

    // Function to show a notification (called when a message is received via SignalR)
    const requestUserAttention = (message = 'Asset Analytics Calculated') => {
        document.title = newNotificationTitle;

        if (blinkIntervalRef.current) {
            clearInterval(blinkIntervalRef.current);
        }

        blinkIntervalRef.current = setInterval(() => {
            document.title =
                document.title === newNotificationTitle ? originalTitle : newNotificationTitle;
        }, 1000);

        if (Notification.permission === 'granted') {
            new Notification('New Notification', { body: message });
        }
    };

    return { shouldNotify: !isFocused || !isVisible, requestUserAttention };
}
