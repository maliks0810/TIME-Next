import config from 'devextreme/core/config';
import { locale } from 'devextreme/localization';
import { ReactNode, useEffect } from 'react';
import { licenseKey } from './devextreme-license';



interface DevExpressProviderProps {
    children: ReactNode;
    locale?: string;
    rtl?: boolean;
}

function DevExpressProvider({
    children,
    locale: userLocale = 'en',
    rtl = false
}: DevExpressProviderProps) {


    useEffect(() => {

        config({
            defaultCurrency: 'USD',
            forceIsoDateParsing: true,
            rtlEnabled: rtl,
            editorStylingMode: 'filled',
            licenseKey: licenseKey
        })

        locale(userLocale);
    }, [userLocale, rtl]);

    return <>{children}</>
}

interface DevExpressProviderProps {
    children: ReactNode;
}

function DevExpressThemeProvider({children}: DevExpressProviderProps) {
    return (
        <DevExpressProvider>
            {children}
        </DevExpressProvider>
    )
}

export { DevExpressThemeProvider };