import { createContext, Dispatch, ReactNode, useCallback, useContext, useState } from 'react';
import { AlertSeverity, TIMEAlert } from '../types/alert-types';

const defaultAlert: TIMEAlert = { severity: AlertSeverity.NONE };

//alert value + severity

const AlertContext = createContext<TIMEAlert>(defaultAlert);
const UpdateAlertContext = createContext<Dispatch<TIMEAlert>>(null!);

export const useAlertInfoContext = () => useContext(AlertContext);
export const useUpdateAlertInfoContext = () => useContext(UpdateAlertContext);

export function AlertProvider(props: { children: ReactNode }) {
    const { children } = props;
    const [alertInfo, setAlertInfo] = useState<TIMEAlert>(defaultAlert);

    const doSetAlert = useCallback((alert: TIMEAlert) => {
        console.debug('doSetAlert called', alert);
        setAlertInfo({ ...alert });
    }, []);

    return (
        <AlertContext.Provider value={alertInfo}>
            <UpdateAlertContext.Provider value={doSetAlert}>{children}</UpdateAlertContext.Provider>
        </AlertContext.Provider>
    );
}
