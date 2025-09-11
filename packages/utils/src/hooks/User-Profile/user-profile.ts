import { gql } from '@apollo/client';
import { UserInfo } from '../Authentication/user-info';
import { useBasicGQLOperation } from '../basic-agql-client';

const APP_NAME = process.env.REACT_APP_NAME;

export const UPDATE_PROFILE = gql`
    mutation UpdateTIMEUserProfile($request: ProfileUpdateRequest!) {
        updateTIMEUserProfile(request: $request) {
            success
        }
    }
`;

export const BUMP_PROFILE = gql`
    mutation UpdateTIMEUserLastUpdated($appname: String!) {
        updateTIMEUserLastUpdated(request: { application: $appname }) {
            success
        }
    }
`;

export function usePersistUserProfile(): { run: (userInfo: UserInfo) => void } {
    const apolloOp = useBasicGQLOperation();

    return {
        run: async (userInfo: UserInfo) => {
            await apolloOp(
                UPDATE_PROFILE,
                {
                    request: {
                        application: APP_NAME,
                        profileJson: JSON.stringify({ favorites: userInfo.favorites }),
                    },
                },
                true
            )
                .then((results) => {
                    if (results?.data?.updateTIMEUserProfile?.success) {
                        console.log('Favorites updated.');
                    } else {
                        console.log('Unable to update favorites for an unknown reason.');
                    }
                })
                .catch((err) => {
                    console.log('error saving user profile', JSON.stringify(err, null, 2));
                });
        },
    };
}

export function useBumpUserProfile(): { run: () => void } {
    const apolloOp = useBasicGQLOperation();

    return {
        run: async () => {
            await apolloOp(BUMP_PROFILE, { appname: APP_NAME }, true)
                .then((results) => {
                    if (results?.data?.updateTIMEUserLastUpdated?.success) {
                        console.log('Profile Bumped.');
                    } else {
                        console.log('Unable to bump profile for an unknown reason.');
                    }
                })
                .catch((err) => {
                    console.log('error bumping user profile', JSON.stringify(err, null, 2));
                });
        },
    };
}
