import { ReactNode, useCallback, useEffect, useState } from 'react';
import {
    Card,
    CardContent,
    CircularProgress,
    Container,
    Stack,
    Typography,
} from '@mui/material';
import BrowserNotSupportedIcon from '@mui/icons-material/BrowserNotSupported';
import { useQreUserAuthorizations } from '../hooks/user-authorizations';
import {
    QreUserAuthorizationsProvider,
    useQreUserAuthorizationsContext,
} from '../contexts/qre-user-authorizations';
import './qre-authorization.scss';

const APP_RESOURCE = 'application';
const APP_ACTION = 'access';

const Unauthorized = (props: { msg?: string | null }) => {
    const { msg } = props;

    return (
        <Container>
            <CardContent /> {/* Just a spacer */}
            <Card variant="elevation" raised>
                <CardContent>
                    <Stack
                        direction="column"
                        spacing={2}
                        justifyContent="center"
                        alignItems="center"
                    >
                        <Stack
                            direction="row"
                            justifyContent="center"
                            alignItems="center"
                            spacing={4}
                        >
                            <Typography variant="h4" color="error">
                                Not Authorized
                            </Typography>
                            <BrowserNotSupportedIcon fontSize="large" color="error" />
                        </Stack>

                        <Typography variant="subtitle1" color="warning">
                            You are not authorized to use this QRE application
                        </Typography>
                        {msg && <Typography>{msg}</Typography>}
                    </Stack>
                </CardContent>
            </Card>
        </Container>
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
        <Container>
            <CardContent /> {/* Just a spacer */}
            <Card>
                <CardContent>
                    <Stack
                        direction="column"
                        spacing={2}
                        justifyContent="center"
                        alignItems="center"
                    >
                        <Typography variant="h6" color="primary">
                            Loading QRE Authorizations
                        </Typography>
                        <Typography>Please Wait.</Typography>
                        <CircularProgress enableTrackSlot size={64} />
                    </Stack>
                </CardContent>
            </Card>
        </Container>
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
