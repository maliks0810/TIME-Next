import { useState, useEffect, useRef } from 'react';
import { useAlertInfoContext } from '../contexts/alert-context';
import { AlertSeverity } from '../types/alert-types';
import { Typography, Popper, Alert, AlertTitle, AlertColor } from '@mui/material';

const SUCCESS_TIMEOUT = 4000;

export const AlertDisplay = (props: { anchor: HTMLElement | null }) => {
    const alerts = useAlertInfoContext();
    const [open, setOpen] = useState<boolean>(false);
    const { anchor } = props;
    const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const severity: AlertColor = alerts.severity.toString() as AlertColor;

    useEffect(() => {
        setOpen(alerts.severity != AlertSeverity.NONE);
        if (alerts.severity == AlertSeverity.SUCCESS) {
            timerRef.current = setTimeout(() => {
                alerts.severity = AlertSeverity.NONE;
                setOpen(false);
            }, SUCCESS_TIMEOUT);
        }
        return () => clearTimeout(timerRef.current);
    }, [alerts]);

    console.debug('AlertDisplay rendering', alerts);

    return (
        <Popper open={open} anchorEl={anchor} placement="bottom">
            <Alert severity={severity} onClose={() => setOpen(false)}>
                {alerts.title && <AlertTitle>{alerts.title}</AlertTitle>}
                {alerts.message ?? ''}
                {alerts.details ?? <Typography variant="caption">{alerts.details}</Typography>}
            </Alert>
        </Popper>
    );
};
