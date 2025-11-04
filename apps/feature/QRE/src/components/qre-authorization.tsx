import { ReactNode, useCallback, useEffect, useState } from 'react';
import { CircularProgress } from '@mui/material';
import BrowserNotSupportedIcon from '@mui/icons-material/BrowserNotSupported';
import { useQreUserAuthorizations } from '../hooks/user-authorizations';
import {
    QreUserAuthorizationsProvider,
    useQreUserAuthorizationsContext,
} from '../contexts/qre-user-authorizations';
import { WaitingEllipses } from './waiting-ellipses';
import './qre-authorization.scss';

const APP_RESOURCE = 'application';
const APP_ACTION = 'access';

const Unauthorized = (props: { msg?: string | null }) => {
    const { msg } = props;

    return (
        <div className="qre-app-unauthorized">
            <div className="qre-app-unauthorized-title">
                Not Authorized
                <BrowserNotSupportedIcon className="qre-app-unauthorized-icon" />
            </div>
            <div className="qre-app-unauthorized-info">
                You are not authorized to use this QRE application
            </div>
            {msg && <div className="qre-app-unauthorized-msg">{msg}</div>}
        </div>
    );
};

const AuthContent = (props: { children: ReactNode }) => {
    const { children } = props;
    const getAuth = useQreUserAuthorizations();
    const [loading, isLoading] = useState<boolean>(false);
    const [unauthMsg, setUnauthMsg] = useState<string | null>(null);
    const [canUse, setCanUse] = useState<boolean>(false);
    const setAuth = useQreUserAuthorizationsContext()[1];

    const loadAuth = useCallback(async () => {
        isLoading(true);
        setCanUse(false);
        setUnauthMsg(null);

        getAuth()
            .then((auths) => {
                setAuth(auths);
                setCanUse(
                    auths.results?.find((s) => s.resource == APP_RESOURCE && s.action == APP_ACTION)
                        ?.authorized ?? false
                );
            })
            .catch(() => {
                setCanUse(true);
                setUnauthMsg('An error occurred while loading authorizations.');
            })
            .finally(() => isLoading(false));
    }, [getAuth, setAuth]);

    useEffect(() => {
        loadAuth();
    }, [loadAuth]);

    return loading ? (
        <div className="qre-app-loading">
            <WaitingEllipses prefix="Loading QRE Authorizations" maintainWidth={true} />
            <CircularProgress />
        </div>
    ) : canUse ? (
        children
    ) : (
        <Unauthorized msg={unauthMsg} />
    );
};

export const QREAuthorization = (props: { children: ReactNode }) => {
    return (
        <QreUserAuthorizationsProvider>
            <AuthContent>{props.children}</AuthContent>
        </QreUserAuthorizationsProvider>
    );
};
