export enum AlertSeverity {
    NONE = 'none',
    SUCCESS = 'success',
    INFO = 'info',
    ERROR = 'error',
    WARNING = 'warning',
}

export type TIMEAlert = {
    severity: AlertSeverity;
    title?: string;
    message?: string;
    details?: string;    
}