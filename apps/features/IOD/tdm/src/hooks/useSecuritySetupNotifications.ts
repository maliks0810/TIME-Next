import { useEffect, useRef } from 'react';
import { IDashboardSecuritySetupRequest } from '../pages/dashboard/lib/DashboardSecuritySetupRequest';
import { useDashboardStore } from '../stores/useDashboardStore';
import { today } from '../utils/DateTimeHelper';
import tcwLogoUrl from '../assets/time-logo.png';

const FLASH_TITLE_PREFIX = '⚠️ New Security Request! | ';
const FLASH_INTERVAL_MS = 500;

export const useSecuritySetupNotifications = (
  securityRequestsData: IDashboardSecuritySetupRequest[] | undefined
) => {
  const notifiedRequestIds = useDashboardStore(s => s.notifiedRequestIds);
  const addNotifiedRequestId = useDashboardStore(s => s.addNotifiedRequestId);
  const originalTitle = useRef(document.title);
  const flashIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const stopFlashing = () => {
      if (flashIntervalRef.current) {
        clearInterval(flashIntervalRef.current);
        flashIntervalRef.current = null;
        document.title = originalTitle.current;
      }
    };
    window.addEventListener('focus', stopFlashing);
    return () => {
      window.removeEventListener('focus', stopFlashing);
      stopFlashing();
    };
  }, []);

  useEffect(() => {
    if (!securityRequestsData || Notification.permission !== 'granted') return;

    const newRequests = securityRequestsData.filter(
      r =>
        (r.setupStatus.toLowerCase() === 'request initiated' ||
         r.setupStatus.toLowerCase() === 'pending dm ssap review' ||
         r.setupStatus.toLowerCase() === 'pending trader details') &&
        r.createdDate.toDateString() === today() &&
        !notifiedRequestIds.has(r.id)
    );

    if (newRequests.length === 0) return;

    for (const request of newRequests) {
      addNotifiedRequestId(request.id);

      const notificationBody = `${request.description ?? ""}\n${request.identifier ?? ""}` 
      const notification = new Notification('New Security Setup Request', {
        body: notificationBody,
        icon: tcwLogoUrl,
      });

      notification.onclick = () => {
        window.open(`/iod/tdm/security-setup?id=${request.id}`, '_blank');
        notification.close();
      };
    }

    if (!flashIntervalRef.current) {
      let flash = true;
      flashIntervalRef.current = setInterval(() => {
        document.title = flash
          ? FLASH_TITLE_PREFIX + originalTitle.current
          : originalTitle.current;
        flash = !flash;
      }, FLASH_INTERVAL_MS);
    }
  }, [securityRequestsData, notifiedRequestIds, addNotifiedRequestId]);
};
