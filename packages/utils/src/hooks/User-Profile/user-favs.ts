import { gql } from '@apollo/client';
import { UserFavorite } from './user-favorite';
import { useBasicGQLOperation } from '../basic-agql-client';

const APP_NAME = 'time';

export const GET_PROFILE = gql`
    query GetTIMEUserProfile($appname: String!) {
        getTIMEUserProfile(request: { application: $appname }) {
            userId
            application
            profileJson
        }
    }
`;

export const useUserFavorites = (): { get: (login: string) => Promise<UserFavorite[]> } => {
    const apolloOp = useBasicGQLOperation();
    let favs: UserFavorite[] = [];

    return {
        get: async (login: string) => {
            await apolloOp(GET_PROFILE, { appname: APP_NAME }, true)
                .then((response) => {
                    if (
                        response.data.getTIMEUserProfile?.userId?.toLowerCase() ==
                            login.toLowerCase() &&
                        response.data.getTIMEUserProfile?.profileJson != 'null'
                    ) {
                        favs = [
                            ...(JSON.parse(response.data.getTIMEUserProfile?.profileJson)[
                                'favorites'
                            ] ?? []),
                        ];
                        console.log('favorites loaded', favs);
                    }
                })
                .catch((err) => {
                    console.log('Error loading favorites');
                    console.log(err);
                });

            return favs;
        },
    };
};
