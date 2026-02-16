import { useEffect, useRef, useState } from 'react';

const newNotificationTitle = 'New Notification!';
const originalTitle = document.title;

export function useRequestUserAttention() {
    const [isVisible, setIsVisible] = useState(!document.hidden);
    const [isFocused, setIsFocused] = useState(document.hasFocus());

    const blinkIntervalRef = useRef<any>(null);

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

    useEffect(() => {
        if (isFocused) {
            document.title = originalTitle;

            if (blinkIntervalRef.current) {
                clearInterval(blinkIntervalRef.current);
            }
        }
    }, [isFocused]);

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
