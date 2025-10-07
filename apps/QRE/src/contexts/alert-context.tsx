import { createContext, useContext, useState } from "react";
import { AlertSeverity, TIMEAlert } from "../types/alert.d";
import { AppProviderProps } from "../types/provider-children";

const defaultAlert: TIMEAlert = {severity: AlertSeverity.NONE};

//alert value + severity

const AlertContext = createContext<TIMEAlert>(defaultAlert);
const UpdateAlertContext = createContext<(alertInfo: TIMEAlert) => void>((i) => i);

export function useAlertInfoContext() {
    return useContext(AlertContext);
}

export function useUpdateAlertInfoContext() {
    return useContext(UpdateAlertContext);
}

export function AlertProvider({ children }: AppProviderProps) {
    const [alertInfo, setAlertInfo] = useState<TIMEAlert>(defaultAlert);

    return (
        <AlertContext.Provider value={alertInfo}>
            <UpdateAlertContext.Provider value={setAlertInfo}>
                {children}
            </UpdateAlertContext.Provider>
        </AlertContext.Provider>
    );
}
