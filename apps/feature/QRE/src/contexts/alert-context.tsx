import { createContext, ReactNode, useContext, useState } from 'react';
import { AlertSeverity, TIMEAlert } from '../types/alert-types';
import { Button, Paper, Link, Typography, Snackbar, Alert, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import React from 'react';

const defaultAlert: TIMEAlert = { severity: AlertSeverity.NONE };

//alert value + severity

const AlertContext = createContext<TIMEAlert>(defaultAlert);
const UpdateAlertContext = createContext<(alertInfo: TIMEAlert) => void>((i) => i);

export function useAlertInfoContext() {
    return useContext(AlertContext);
}

export function useUpdateAlertInfoContext() {
    return useContext(UpdateAlertContext);
}

export function AlertProvider(props: { children: ReactNode }) {
    const { children } = props;
    const [alertInfo, setAlertInfo] = useState<TIMEAlert>(defaultAlert);

    const action = (
        <React.Fragment>
            <Button color="secondary" size="small">
                UNDO
            </Button>
            <IconButton size="small" aria-label="close" color="inherit">
                <CloseIcon fontSize="small" />
            </IconButton>
        </React.Fragment>
    );

    return (
        <AlertContext.Provider value={alertInfo}>
            <UpdateAlertContext.Provider value={setAlertInfo}>
                <>
                    {children}
                    <Snackbar
                        open={alertInfo.severity != AlertSeverity.NONE}
                        autoHideDuration={alertInfo.severity == AlertSeverity.SUCCESS ? 6000 : 0}
                        message="Note archived"
                        action={action}
                    />
                </>
            </UpdateAlertContext.Provider>
        </AlertContext.Provider>
    );
}
