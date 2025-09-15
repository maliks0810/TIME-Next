import { gql } from '@apollo/client';
import { BULK_AUTH_ITEMS_REQ } from './auth-items-req';
import { AuthIndicator } from './auth-indicator';
import { useBasicGQLOperation } from '../basic-agql-client';

export const GET_BULK_AUTH = gql`
    query BulkAuthorizations($request: BulkAuthorizationsInput!) {
        bulkAuthorizations(request: $request) {
            results {
                resource
                action
                authorized
            }
        }
    }
`;

export const useUserAuthorizations = (): { get: () => Promise<AuthIndicator[]> } => {
    const apolloOp = useBasicGQLOperation();
    let auth: AuthIndicator[] = [];

    return {
        get: async () => {
            await apolloOp(GET_BULK_AUTH, { request: BULK_AUTH_ITEMS_REQ }, true)
                .then((response) => {
                    auth = [...response.data.bulkAuthorizations.results];
                    console.log('Authorizations loaded.', auth);
                })
                .catch((err) => {
                    console.log('Authorization error:');
                    console.log(err);
                });

            return auth;
        },
    };
};
