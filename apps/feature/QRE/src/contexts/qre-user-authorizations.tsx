import { createContext, Dispatch, ReactNode, useContext, useState } from 'react';
import { QreBulkAuthorizations } from '../types/qre-authorization-types';


const QreUserAuthorizationsContext = createContext<[QreBulkAuthorizations, Dispatch<QreBulkAuthorizations>]>(null!);

export const useQreUserAuthorizationsContext = () => useContext(QreUserAuthorizationsContext);

export const QreUserAuthorizationsProvider = (props: { children: ReactNode }) => {
    const { children } = props;
    const auths = useState<QreBulkAuthorizations>({totalCount: 0});

    return (
        <QreUserAuthorizationsContext.Provider value={auths}>
            {children}
        </QreUserAuthorizationsContext.Provider>
    );
};
