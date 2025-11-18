import * as tlog from '@tcw/tlog';
import { useCallback } from 'react';
import { QreBulkAuthorizations } from '../types/qre-authorization-types';
import { useModelCatalogAxiosContext } from '../contexts/model-catalog-axios-context';
import { NoTrailingForwardSlash } from '../utils/url-utils';
import { ToQreBulkAuthorizations } from '../utils/authorization-utils';

export const QRE_CONTENT_MGMT_URL = NoTrailingForwardSlash(import.meta.env.VITE_TRAP_QRE_CONTENT_MGMT);
export const QRE_BULK_AUTH = `${QRE_CONTENT_MGMT_URL}/authorizations/bulk`;

export const useQreUserAuthorizations = (): (() => Promise<QreBulkAuthorizations>) => {
    const axios = useModelCatalogAxiosContext();

    return useCallback(async (): Promise<QreBulkAuthorizations> => {
        const url = QRE_BULK_AUTH;
        const authItems = {
            items: [
                {
                    resource: 'application',
                    action: 'access',
                },
                {
                    resource: 'application',
                    action: 'admin',
                },                
                {
                    resource: 'catalog',
                    action: 'copy',
                },
                {
                    resource: 'catalog',
                    action: 'create',
                },
                {
                    resource: 'catalog',
                    action: 'delete',
                },
                {
                    resource: 'catalog',
                    action: 'read',
                },
                {
                    resource: 'catalog',
                    action: 'synchronize',
                },     
                {
                    resource: 'catalog',
                    action: 'update',
                },       
                {
                    resource: 'configurations',
                    action: 'update',
                },                                                                                        
            ],
        };

        return axios()
            .post(url, authItems)
            .then((response) => {
                const auths = ToQreBulkAuthorizations(response.data);
                if (!auths) {
                    throw new Error(
                        'No bulk authorization data was returned or it was incorrectly formatted.'
                    );
                }

                return auths;
            })
            .catch((err) => {
                tlog.error(
                    err,
                    `Unexpected Error while requesting QRE bulk authorization.`,
                    'useQreUserAuthorizations',
                    undefined,
                    { url: url }
                );
                //Allow the UI to do something with the error
                throw err;
            });
    }, [axios]);
};
